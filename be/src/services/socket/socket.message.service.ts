import * as socketIO from 'socket.io';
import * as models from '../../models'
import * as services from '../../services'
import * as utils from '../../utilities'

export class SocketMessageService {
  private _ioServer: socketIO.Server;
  private _apiMessageService: services.api.ApiMessageService
  private _authService: services.socket.SocketAuthService

  constructor(
    ioServer: socketIO.Server,
    apiMessageService: services.api.ApiMessageService,
    authSocketService: services.socket.SocketAuthService
  ) {
    this._ioServer = ioServer;
    this._apiMessageService = apiMessageService
    this._authService = authSocketService
  }

  //----------------------------------- NOTIFIER METHODS ---------------------------------------//
  // Broadcast the message to all connected clients
  public async notifyMessageReceivedResponse(message: models.Messages.FrontendMessage) {

    try {
      // save message to the database
      const createdMessage = await this._apiMessageService.saveMessage(message);
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

   //----------------------------------- LISTENER METHODS ---------------------------------------//
  // This method will register the events to the socket.
  public registerMessageEvents(socket: socketIO.Socket): void {

    socket.on('sendMessageRequest', (message: models.Messages.FrontendMessage) => {
      this.notifyMessageReceivedResponse(message)
    });
    
  }
}
