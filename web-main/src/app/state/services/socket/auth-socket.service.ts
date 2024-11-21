import * as ngCore from '@angular/core'
import * as service from '../socket/'

@ngCore.Injectable({
  providedIn: 'root',
})
export class AuthSocketService {
  private readonly _socketIO = ngCore.inject(service.SocketIOService)
 
  /**
   * 
   * Notify the back end of the client being authenticated by emiting `clientAuthenticated` request 
   * for the purposes of updating the online users map.
   */
  public clientAuthenticated(userId: string): void {
    // Ensure the socket connection is initialized
    this._socketIO.initializeSocketConnection()

    const socket = this._socketIO.getSocket()

    if (socket) {
      if (socket.connected) {
        // Emit immediately if socket is already connected
        socket.emit('clientAuthenticated', userId)
      } else {
        // Wait for the socket to connect
        socket.once('connect', () => {
          console.log('Socket connected, emitting clientAuthenticated')
          socket.emit('clientAuthenticated', userId)
        })
      }
    } else {
      console.error('Socket instance is undefined.')
    }
  }
  /**
   * 
   * Notify the back end of the client being deauthenticated by emiting `clientDeauthenticated` request 
   * for the purposes of updating the online users map.
   */
  public clientDeauthenticated(): void {
    this._socketIO.initializeSocketConnection()

    const socket = this._socketIO.getSocket()

    if (socket) {
      if (socket.connected) {
        // Emit immediately if socket is already connected
        socket.emit('clientDeauthenticated')
      } else {
        // Wait for the socket to connect
        socket.once('connect', () => {
          console.log('Socket connected, emitting clientDeauthenticated')
          socket.emit('clientDeauthenticated')
        })
      }
    } else {
      console.error('Socket instance is undefined.')
    }
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
