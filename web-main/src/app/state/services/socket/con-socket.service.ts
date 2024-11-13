import * as ngCore from '@angular/core'
import * as socket from 'socket.io-client'
import * as socketIO from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models';

@ngCore.Injectable({
    providedIn: 'root',
})
export class ConSocket {
    private _socket: socket.Socket | undefined;
    private readonly _socketIO = ngCore.inject(socketIO.SocketIOService)

    public conParticipantsUpdated$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
    

    constructor() {
        this.initializeSocket()
        this.setupSocketListeners()
    }

    //initialize socket connection and assign socket instance to _socket
    private initializeSocket(): void {
        if (!this._socket) {
            this._socketIO.initializeSocketConnection();
            this._socket = this._socketIO.getSocket();
        }
    }

    setupSocketListeners():void {
        this._socket?.on('conParticipantListUpdatedResponse', (conversation:any)=>{
            console.log(`convUpdated retrieved:`, conversation.conId)
            const transformConv:models.Conversation = {
                id: conversation.conId,
                participantIds: conversation.participantIds
            }
           console.log(`2. transformed:`, transformConv)
            this.conParticipantsUpdated$.next(transformConv)
        })
    }

    public updateConParticipantListRequest(conId: models.Conversation.Id, participantIds?: models.User.Id[] ):void{
       
        this._socket?.emit('updateParticipantListRequest', conId,participantIds)
    }

    public disconnect(): void {
        this._socket?.disconnect()
      }
}
