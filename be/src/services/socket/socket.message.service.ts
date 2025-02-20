import * as socketIO from 'socket.io'
import * as models from '@common/models'
import * as services from '../../services'
import * as ConUtils from '../../utilities/conversation-utils'

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
  // Broadcast private message to corresponding connected client
  public async sendPrivMessageResponse(message: models.Conversation.Message.Input) {
    
    try {
      // save message to the database
      const savedMessage = await this._apiMessageService.saveMessage(message)
      // extract participantIds
      const conParticipantsIds = await ConUtils.API.getUserIdsByConversationId(message.conId)
      // Broadcast to all participants in the conversation
     
      conParticipantsIds.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('receivedPrivMessageResponse', savedMessage)
        }
      })
    } catch (error) {
      console.error('Error saving private message to database:', error)
    }
  }
   // Broadcast public message to corresponding connected clients
  public async sendPubMessageResponse(message: models.Conversation.Message.Input) {
    try {
      // save message to the database
      const savedMessage = await this._apiMessageService.saveMessage(message)
      // collect pub conv pariticipant ids
      const conParticipantsIds = await ConUtils.API.getUserIdsByConversationId(message.conId)
      // Broadcast to all participants in the conversation
      conParticipantsIds.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('receivedPubMessageResponse', savedMessage)
        }
      })

    } catch (error) {
      console.error('Error saving public message to database:', error)
    }
  }
  /**
   * Marks private message/s to `seen` on a private conversation click event and then it 
   * dispatches the notifcation other partcipant of his message/s being seen.
   */
  public async sendPrivConClickedSeenResponse(conId: models.Conversation.Id, selfId: models.User.Id) {
    try {

      // Get the seen messages and group them by userId along with conversationId
      const seenMessageIds = await this._apiMessageService.setPrivConvMessagesAsSeen(conId, selfId)
      // Get the participant IDs in the conversation
      const conParticipantsIds = (await ConUtils.API.getUserIdsByConversationId(conId))
      const notselfParticipantId = conParticipantsIds.filter(userId => userId != selfId)


      // Emit the seen message data to each participant
      notselfParticipantId.forEach(userId => {
 
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

  public async sendPubConClickedSeenResponse(conId: models.Conversation.Id, selfId: models.User.Id): Promise<void> {
    try {
        //1. find the con and mark all messages in it as seen by selfId (messageSeen table entries)
        const seenMessages = await this._apiMessageService.setPubConvMessagesAsSeen(conId, selfId)

        if (seenMessages) {
          // Send the seen message data to other participants via socket
          this.sendSeenPubMessagesToSender(seenMessages)
        }

        const payload = await this._apiMessageService.seenSelfMsgIdsByConversationId(selfId,conId)
        //console.log(`payload:`,payload)
        //2. dispatch a notification of this to the sender of the message, so that he can update his state.
        const participantSocketId = this._authService.getSocketIdByUserId(selfId)
        if(participantSocketId){
          this._ioServer.to(participantSocketId).emit('sendPubConClickedSeenResponse', payload)
        }


    } catch (error) {
      console.error('Error saving message to database:', error)
    }
  }

  sendSeenPubMessagesToSender(seenMessages: any) {
    for (const userId in seenMessages) {
      const userPayload = seenMessages[userId]

      // Emit only messages seen by the specific user
      // console.log(`Emitting a message to ${userId}`)
      // console.log(`Message:`,JSON.stringify(userPayload))
      const participantSocketId = this._authService.getSocketIdByUserId(userId)
      if(participantSocketId){
        this._ioServer.to(participantSocketId).emit('sendSeenPubMessagesToSenderResponse', userPayload)
      }
      
    }
  }


   //----------------------------------- LISTENER METHODS ---------------------------------------//
  // This method will register the events to the socket.
  public registerMessageEvents(socket: socketIO.Socket): void {

    socket.on('sendPrivMessageRequest', (message: models.Conversation.Message.Input) => {
      this.sendPrivMessageResponse(message)
    })

    socket.on('sendPubMessageRequest', (message: models.Conversation.Message.Input) => {
      this.sendPubMessageResponse(message)
    })
    socket.on('sendPrivConClickedSeenRequest', (conId: models.Conversation.Id, selfId: models.User.Id) => {
      //console.log(`1. BACK END RECEIVED:`, conId,selfId)
      this.sendPrivConClickedSeenResponse(conId,selfId)
    })
    socket.on('sendPubConClickedSeenRequest', (conId: models.Conversation.Id, selfId: models.User.Id) => {
    // console.log(`1. BACK END PUB MSG SEEN REQUEST RECEIVED:`, conId,selfId)
      this.sendPubConClickedSeenResponse(conId,selfId)
    })
  }
}
