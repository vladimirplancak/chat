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
         if (!this._socket) {
            this._socketIO.initializeSocketConnection()
            this._socket = this._socketIO.getSocket()
          }
        this._socket?.emit('clientAuthenticated', userId)   
    }
}
