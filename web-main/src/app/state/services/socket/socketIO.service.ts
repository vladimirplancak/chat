import * as ngCore from '@angular/core'
import * as socketIoClient from 'socket.io-client'
import * as models from '../../../models'
import * as rxjs from 'rxjs'
@ngCore.Injectable({
  providedIn: 'root',
})
export class SocketIOService {
  private _socket: socketIoClient.Socket | undefined
  private readonly _socketUrl = 'http://localhost:5000'
  private _isAuthenticated = false
  private _socketConnection$: rxjs.BehaviorSubject<boolean> = new rxjs.BehaviorSubject(false)

  constructor() {
    this.initializeAuthStatusFromToken()
   }

  private initializeAuthStatusFromToken(){
    const token = models.Auth.LocalStorage.Tokens.getAccessToken()
    this._isAuthenticated = !!token
    if(this._isAuthenticated){
      // console.log('Token found, user is authenticated. Initializing socket connection.')
      this.initializeSocketConnection()
    }else{
      // console.warn('No token found. User is not authenticated.')
    }
  } 
  // Initialize the socket connection only if authenticated (token exists) and socket exists
  public initializeSocketConnection(): void {
    if (this._isAuthenticated && !this._socket) {
      this._socket = socketIoClient.io(this._socketUrl, { withCredentials: true })
  
      this._socket.on('connect', () => {
        console.warn('Socket connected')
        this._socketConnection$.next(true)
      })
  
      this._socket.on('disconnect', () => {
        console.warn('Socket disconnected')
        this._socket = undefined
        this._socketConnection$.next(false)
      })
    } else if (!this._isAuthenticated) {
      console.warn('Cannot initialize socket. User is not authenticated.')
    }
  }
  public onSocketConnected(): rxjs.Observable<boolean> {
    return this._socketConnection$.asObservable().pipe(
      rxjs.filter((connected) => connected),
    )
     
  }
  /**
   * Authenticate the client by setting the flag
   * _isAuthenticated = true and calling initializeSocketConnection().
   */
  public authenticate(): void {
    this._isAuthenticated = true
    this.initializeSocketConnection()
  }
    /**
   * Deauthenticate the client by setting the flag
   * _isAuthenticated = true and calling disconnectSocket().
   */
  public deauthenticate(): void {
    this._isAuthenticated = false
    this.disconnectSocket()
  }
    /**
     * Explicit socket disconnect.
     */
    public disconnectSocket(): void {
      if (this._socket) {
        this._socket.disconnect()
        this._socket = undefined
      }
    }
  
  // Method to get the instance of the socket 
  getSocket(): socketIoClient.Socket | undefined {
    return this._socket
  }
}
