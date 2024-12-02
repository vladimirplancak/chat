import * as socketIO from 'socket.io';
import * as models from '../../models'
import * as services from '../api'

export class SocketMessageService {
  private _ioServer: socketIO.Server;
  private _apiMessageService: services.ApiMessageService

  constructor(ioServer: socketIO.Server, apiMessageService:services.ApiMessageService) {
    this._ioServer = ioServer;
    this._apiMessageService = apiMessageService
  }

  // Broadcast the message to all connected clients
  public async notifyMessageResponse(message: models.Messages.FrontendMessage) {
    console.log(`notifyMessageResponse`, message)
    try {
   // Save the message via the API service
      const createdMessage = await this._apiMessageService.saveMessage(message);
      console.log('Message saved to database:', createdMessage)

      // Broadcast to other clients
      this._ioServer.emit('receivedMessageResponse', createdMessage)

    } catch (error) {
      console.error('Error saving message to database:', error)
    }

  }

    // This method will register the events to the socket.
    public registerMessageEvents(socket: socketIO.Socket): void {
        socket.on('sendMessageRequest', (message: models.Messages.FrontendMessage) => {
          console.log(`sendMessageRequest`, message)
          this.notifyMessageResponse(message)
        });
      }
}
