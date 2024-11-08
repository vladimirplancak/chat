import * as ngCore from '@angular/core'
import * as socket from 'socket.io-client'
import * as socketIO from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models';

@ngCore.Injectable({
  providedIn: 'root',
})
export class MessageSocket {
  private _socket: socket.Socket | undefined;
  private readonly _socketIO = ngCore.inject(socketIO.SocketIOService)
  public messageReceived$: rxjs.Subject<models.Conversation.Message.InContext> = new rxjs.Subject()

  constructor() {
    this._socket = this._socketIO.getSocket()
    this.setupSocketListeners()
  }


  private setupSocketListeners(): void {
    // Listen for new messages from the server
    this._socket?.on('newMessage', (message: models.Conversation.Message.InContext) => {
      this.messageReceived$.next(message)
    })
  }

  // Send message to the server
  public sendMessage(message: models.Conversation.Message.InContext.Input): void {
    this._socket?.emit('sendMessage', message)
  }

  public disconnect(): void {
    this._socket?.disconnect()
  }
}
