import * as ngCore from '@angular/core'
import * as socketIoClient from 'socket.io-client'
import * as service from '../socket/socketIO.service'

@ngCore.Injectable({
    providedIn: 'root',
})
export class AuthSocketService {
    private readonly _socketIO = ngCore.inject(service.SocketIOService)
    private _socket: socketIoClient.Socket | undefined
    
     // Notify the back end of client being authenticated
    clientAuthenticated(userId: string) {
         // Initialize the socket connection if not already done
         if (!this._socket?.connected) {
            this._socketIO.initializeSocketConnection()
            this._socket = this._socketIO.getSocket()
          }
        this._socket?.emit('clientAuthenticated', userId)   
    }

    // Notify the back end of client being disconnected
    clientLoggedOut() {
        // Initialize the socket connection if not already done
        if (!this._socket) {
            this._socketIO.initializeSocketConnection()
            this._socket = this._socketIO.getSocket()
        }
        this._socket?.emit('clientLoggedOut')
    }
    //built in method, this occurs when connection is suddenly terminated
    //via internet connection being dropped or user closing the tab in the 
    //browser
    public disconnectSocket(): void {
        if (this._socket && this._socket.connected) {
          this._socket.disconnect(); // Close the socket connection
          this._socket = undefined
          console.log('Socket disconnected');
        }
      }
      
}
