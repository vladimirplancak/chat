// socket.service.ts
import * as ngCore from '@angular/core';
import * as socket from 'socket.io-client';

@ngCore.Injectable({
  providedIn: 'root',
})
export class SocketIOService {
  private _socket: socket.Socket | undefined;
  private readonly _socketUrl = 'http://localhost:5000';

  constructor() {
    this.initializeSocketConnection();
  }

  private initializeSocketConnection(): void {
    this._socket = socket.io(this._socketUrl, { withCredentials: true });

    this._socket.on('connect', () => console.log('Socket connected'));
    this._socket.on('disconnect', () => console.log('Socket disconnected'));
  }

  // Method to get the socket instance
  getSocket(): socket.Socket | undefined {
    return this._socket;
  }
}
