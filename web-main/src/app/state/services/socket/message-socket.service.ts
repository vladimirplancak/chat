import * as ngCore from '@angular/core'
import { Socket } from 'socket.io-client'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models'
import * as commonModels from '@common/models'

@ngCore.Injectable({
  providedIn: 'root',
})
export class MessageSocketService implements ngCore.OnDestroy {

  constructor() {
    this.setupSocketListeners()
  }
  
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

  public privMessageReceived$: rxjs.Subject<models.Conversation.Message.InContext> = new rxjs.Subject()
  public pubMessageReceived$: rxjs.Subject<models.Conversation.Message.InContext> = new rxjs.Subject()
  public seenMsgIdsReceived$: rxjs.Subject<models.Conversation.Message.SeenPrivateMsgsResponse> = new rxjs.Subject()
  public seenPubMsgsIdsReceived$: rxjs.Subject<models.Conversation.Message.SeenPublicMsgsResponse> = new rxjs.Subject()
  public notSelfPubMsgsSeenReceived$: rxjs.Subject<{
    conId: models.Conversation.Id
    response: models.Conversation.Message.SeenPublicMsgsResponse
  }> = new rxjs.Subject()
  
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

    // Listen for new private messages from the server
    socket.on('receivedPrivMessageResponse', (message: any) => {
      // models.Conversation.Message.InContext.assertIsMesageInContext(message)
      const transformedMessage: models.Conversation.Message.InContext = {
        id: message.id,
        userId: message.userId,
        content: message.content,
        dateTime: new Date(message.dateTime),
        conId: message.conversationId,
        isSeen: message.isSeen
      }
      this.privMessageReceived$.next(transformedMessage)
    })

    // Listen for new public messages from the server
    socket.on('receivedPubMessageResponse', (message: any) => {
      // models.Conversation.Message.InContext.assertIsMesageInContext(message)
      const transformedMessage: models.Conversation.Message.InContext = {
        id: message.id,
        userId: message.userId,
        content: message.content,
        dateTime: new Date(message.dateTime),
        conId: message.conversationId,
        isSeen: message.isSeen
      }
      this.pubMessageReceived$.next(transformedMessage)
    })

    socket.on('sendConClickedSeenResponse', (data: any) => {
      console.log(`response from the server:`, data)
      this.seenMsgIdsReceived$.next(data)
    })
    
    socket.on('sendPubConClickedSeenResponse', (data: any) => {
      // console.log(`received pub seen msgIds/userIds data:`, data)
      this.seenPubMsgsIdsReceived$.next(data)
    })

    socket.on('sendSeenPubMessagesToSenderResponse', (data: any)=>{
      const transformedData = this.transformPayload(data)
      // console.log(`receiving data from back end:`, data)
     // console.log(`transformed data from back end:`, transformedData)
      this.notSelfPubMsgsSeenReceived$.next(transformedData)
    })
  }

  //---------------------------------------- EMITTERS ---------------------------------------//
  public sendPrivMessage(message: commonModels.Conversation.Message.InContext.Input): void {
    this._connectedSocket$.pipe(
      rxjs.tap(() => {
        const socket = this._socketIOService.getSocket()
        if (socket) {
          socket.emit('sendPrivMessageRequest', message)
        } else {
          console.error('Socket instance is undefined. Cannot emit send priv message request.')
        }
      })
    ).subscribe()

  }

  public sendPubMessage(message: commonModels.Conversation.Message.InContext.Input): void {
    this._connectedSocket$.pipe(
      rxjs.tap(() => {
        const socket = this._socketIOService.getSocket()
        if (socket) {
          socket.emit('sendPubMessageRequest', message)
        } else {
          console.error('Socket instance is undefined. Cannot emit send pub message request.')
        }
      })
    ).subscribe()

  }

  sendPrivConClickedSeenRequest(conId: models.Conversation.Id, selfId: models.User.Id): void {
    this._connectedSocket$.pipe(
      rxjs.tap(() => {
        const socket = this._socketIOService.getSocket()
        if (socket) {
          // console.log(`msg-socket.service.ts / sendPrivConClickedSeenRequest:`, conId, selfId)
          socket.emit('sendPrivConClickedSeenRequest', conId,selfId)
        } else {
          console.error('Socket instance is undefined. Cannot emit send con clicked seen private message request.')
        }
      })
    ).subscribe()
  }
  sendPubConClickedSeenRequest(conId: models.Conversation.Id, selfId: models.User.Id): void {
    this._connectedSocket$.pipe(
      rxjs.tap(() => {
        const socket = this._socketIOService.getSocket()
        if (socket) {
          socket.emit('sendPubConClickedSeenRequest', conId,selfId)
        } else {
          console.error('Socket instance is undefined. Cannot emit send con clicked seen public message request.')
        }
      })
    ).subscribe()
  }
  // public disconnect(): void {
  //   this._socket?.disconnect()
  // }

  //---------------------------------------- MISC FUNCTIONS ---------------------------------------//

  transformPayload = (data: Array<{ conversationId: string, messageId: string, seenByUserIds: string }>) => {
    const conId = data[0]?.conversationId //  all entries in `data` belong to the same conversation
    const response = data.reduce((acc, { messageId, seenByUserIds }) => {
      if (!acc[messageId]) {
        acc[messageId] = []
      }
      acc[messageId].push(seenByUserIds)
      return acc
    }, {} as models.Conversation.Message.SeenPublicMsgsResponse)
  
    return { conId, response }
  }
  
}
