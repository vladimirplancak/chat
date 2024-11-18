import * as ngCore from '@angular/core'
import * as socketIoClient from 'socket.io-client'

@ngCore.Injectable({
  providedIn: 'root',
})
export class SocketIOService {
  private _socket: socketIoClient.Socket | undefined
  private readonly _socketUrl = 'http://localhost:5000'

  constructor() { }

  //initialize the socket connection only when needed
  public initializeSocketConnection(): void {
    if (!this._socket) {
      this._socket = socketIoClient.io(this._socketUrl, { withCredentials: true })
      this._socket.on('connect', () => console.log('Socket connected'))
      this._socket.on('disconnect', () => console.log('Socket disconnected'))
    }
  }

  // Method to get the socket instance
  getSocket(): socketIoClient.Socket | undefined {
    return this._socket
  }
}
