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
    public conParticipantRemoved$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()

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
            
            const transformConv:models.Conversation = {
                id: conversation.conId,
                participantIds: conversation.participantIds
            }
          console.log(`transformConv`, transformConv)
            this.conParticipantsUpdated$.next(transformConv)
        })

        this._socket?.on('conParticipantRemovedResponse', (conId:any) =>{
            console.log(`does it work?:`, conId)
            this.conParticipantRemoved$.next(conId)
        })
    }

    public updateConParticipantListRequest(conId: models.Conversation.Id, participantIds?: models.Conversation.Update ):void{
       console.log(`emit event payload:`, participantIds)
        this._socket?.emit('updateParticipantListRequest', conId,participantIds)
    }

    public disconnect(): void {
        this._socket?.disconnect()
      }
}
