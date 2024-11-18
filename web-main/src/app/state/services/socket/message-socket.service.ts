import * as ngCore from '@angular/core'
import * as socketIoClient from 'socket.io-client'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models';

@ngCore.Injectable({
  providedIn: 'root',
})
export class MessageSocketService {
  private _socket: socketIoClient.Socket | undefined;
  private readonly _socketIOService = ngCore.inject(service.SocketIOService)
  public messageReceived$: rxjs.Subject<models.Conversation.Message.InContext> = new rxjs.Subject()

  constructor() {
    this.initializeSocket();
    this.setupSocketListeners()
  }

  //initialize socket connection and assign socket instance to _socket
  private initializeSocket(): void {
    if (!this._socket) {
      this._socketIOService.initializeSocketConnection();
      this._socket = this._socketIOService.getSocket();
    }
  }

  //---------------------------------------- LISTENERS ---------------------------------------//
  private setupSocketListeners(): void {

    // Listen for new messages from the server
    this._socket?.on('newMessage', (message: any) => {
      // models.Conversation.Message.InContext.assertIsMesageInContext(message)
      const transformedMessage: models.Conversation.Message.InContext = {
        id: message.id,
        userId: message.userId,
        content: message.content,
        datetime: new Date(message.dateTime),
        conId: message.conversationId,
      };
      this.messageReceived$.next(transformedMessage)
    })
  }

  //---------------------------------------- EMITTERS ---------------------------------------//
  public sendMessage(message: models.Conversation.Message.InContext.Input): void {
    this._socket?.emit('sendMessage', message)
  }

  public disconnect(): void {
    this._socket?.disconnect()
  }

}
