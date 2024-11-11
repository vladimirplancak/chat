// auth-socket.service.ts
import * as ngCore from '@angular/core'
import * as socket from 'socket.io-client'
import * as socketIO from '../socket/socketIO.service'

@ngCore.Injectable({
    providedIn: 'root',
})
export class AuthSocket {
    private _socket: socket.Socket | undefined

    private readonly _socketIO = ngCore.inject(socketIO.SocketIOService)

    constructor() {}
    
     // Register the user only after socket has been initialized
    register(userId: string) {
         // Initialize the socket connection if not already done
         if (!this._socket) {
            this._socketIO.initializeSocketConnection();
            this._socket = this._socketIO.getSocket();
          }
        this._socket?.emit('clientAuthenticated', userId)
        console.log(`Emitted clientAuthenticated for userId: ${userId}`)
    }
}
