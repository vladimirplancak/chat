import * as socketIO from 'socket.io'
import * as models from '../../models'
import * as services from '../../services'
import * as utils from '../../utilities'

export class SocketMessageService {
  private _ioServer: socketIO.Server
  private _apiMessageService: services.api.ApiMessageService
  private _authService: services.socket.SocketAuthService

  constructor(
    ioServer: socketIO.Server,
    apiMessageService: services.api.ApiMessageService,
    authSocketService: services.socket.SocketAuthService
  ) {
    this._ioServer = ioServer
    this._apiMessageService = apiMessageService
    this._authService = authSocketService
  }

  //----------------------------------- NOTIFIER METHODS ---------------------------------------//
  // Broadcast the message to all connected clients
  public async sendMessageResponse(message: models.Messages.FrontendMessage) {

    try {
      // save message to the database
      const createdMessage = await this._apiMessageService.saveMessage(message)
      // extract participantIds
      const conParticipantsIds = await utils.ConUtils.getUserIdsByConversationId(createdMessage.conversationId)
      // Broadcast to all participants in the conversation
      conParticipantsIds.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('receivedMessageResponse', createdMessage)
        }
      })
    } catch (error) {
      console.error('Error saving message to database:', error)
    }
  }

  public async sendConClickedSeenResponse(conId: models.Conversation.id, selfId: models.User.id) {
    try {
       // Get the seen messages and group them by userId along with conversationId
       const seenMessageIds = await this._apiMessageService.setConvMessagesAsSeen(conId, selfId)
        // Get the participant IDs in the conversation
        const conParticipantsIds = (await utils.ConUtils.getUserIdsByConversationId(conId))
        const filteredParticipantIds = conParticipantsIds.filter(userId => userId != selfId)

      
        // Emit the seen message data to each participant
        filteredParticipantIds.forEach(userId => {
       
            const participantSocketId = this._authService.getSocketIdByUserId(userId)
            if (participantSocketId && seenMessageIds) {
                // Send the grouped message IDs and conversationId to each participant
                const data = seenMessageIds[userId]
                if (data) {
             
                    this._ioServer.to(participantSocketId).emit('sendConClickedSeenResponse', data)
                }
            }
        })

    } catch (error) {
        console.error('Error saving message to database:', error)
    }
}


   //----------------------------------- LISTENER METHODS ---------------------------------------//
  // This method will register the events to the socket.
  public registerMessageEvents(socket: socketIO.Socket): void {

    socket.on('sendMessageRequest', (message: models.Messages.FrontendMessage) => {
      this.sendMessageResponse(message)
    })
    
    socket.on('sendConClickedSeenRequest', (conId: models.Conversation.id, selfId: models.User.id) => {
      this.sendConClickedSeenResponse(conId,selfId)
    })
  }
}
