import * as ngCore from '@angular/core'
import { Socket } from 'socket.io-client'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models';

@ngCore.Injectable({
  providedIn: 'root',
})
export class MessageSocketService implements ngCore.OnDestroy {

  ngOnDestroy(): void {
    this._destroySubscription$.next()
    this._destroySubscription$.complete()
  }
  private readonly _socketIOService = ngCore.inject(service.SocketIOService)
  private readonly _destroySubscription$ = new rxjs.Subject<void>()
  private _connectedSocket$ = this._socketIOService.onSocketConnected()
    .pipe(
      rxjs.shareReplay(1),
      rxjs.takeUntil(this._destroySubscription$)
    )

  public messageReceived$: rxjs.Subject<models.Conversation.Message.InContext> = new rxjs.Subject()

  constructor() {
    this.setupSocketListeners()
  }

  //---------------------------------------- LISTENERS ---------------------------------------//
  private setupSocketListeners(): void {
    this._connectedSocket$.subscribe(() => {
      const socket = this._socketIOService.getSocket()
      if (socket) {
        // console.log('Socket connected. Setting up listeners.')
        this.registerSocketListeners(socket)
      } else {
        console.error('Socket instance is undefined.')
      }
    })
  }

  private registerSocketListeners(socket: Socket): void {

    // Listen for new messages from the server
    socket.on('receivedMessageResponse', (message: any) => {
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
    this._connectedSocket$.pipe(
      rxjs.tap(() => {
        const socket = this._socketIOService.getSocket()
        if (socket) {
          socket.emit('sendMessageRequest', message)
        } else {
          console.error('Socket instance is undefined. Cannot emit send message request.')
        }
      })
    ).subscribe()

  }

  // public disconnect(): void {
  //   this._socket?.disconnect()
  // }

}
