import * as ngCore from '@angular/core'
import * as service from '../socket/'
import * as rxjs from 'rxjs'

@ngCore.Injectable({
  providedIn: 'root',
})
export class AuthSocketService implements ngCore.OnDestroy {
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
  private readonly _socketIO = ngCore.inject(service.SocketIOService)
  private readonly _userSocketService = ngCore.inject(service.UserSocketService)
  /**
   * 
   * Notify the back end of the client being authenticated by emiting `clientAuthenticated` request 
   * for the purposes of updating the online users map.
   */
  public clientAuthenticated(userId: string): void {
    this._connectedSocket$
      .pipe(
        rxjs.first(),
       // rxjs.tap(() => console.log('Socket action triggered')),
        rxjs.tap(() => {
          const socket = this._socketIOService.getSocket()
          if (socket) {
            socket.emit('clientAuthenticated', userId)
            this._userSocketService.requestOnlineUsersMap(userId)
          } else {
            console.error('Socket instance is undefined. Cannot emit client authenticated request.')
          }
        })
      )
      .subscribe() // Keep subscription for side effects only
  }
  /**
   * 
   * Notify the back end of the client being deauthenticated by emiting `clientDeauthenticated` request 
   * for the purposes of updating the online users map.
   */
  public clientDeauthenticated(): void {
    this._connectedSocket$.pipe(
      rxjs.first(),
      //rxjs.tap(() => console.log('Socket action triggered')),
      rxjs.tap(()=>{
        const socket = this._socketIOService.getSocket()
        if (socket) {
          socket.emit('clientDeauthenticated')
        } else {
          console.error('Socket instance is undefined. Cannot emit client deauthenticated request.')
        }
      })
    )
    .subscribe()
  }

  // Disconnect the socket
  public disconnectSocket(): void {
    const socket = this._socketIO.getSocket()
    if (socket?.connected) {
      socket.disconnect() // Close the socket connection
      console.warn('Socket disconnected')
    }
  }
}
