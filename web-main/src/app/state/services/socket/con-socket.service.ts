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
    public conParticipantAdded$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()
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

    setupSocketListeners(): void {

        //notifies the all current participants of the conv of additions/removals of
        //additional participants
        this._socket?.on('conParticipantListUpdatedResponse', (conversation: any) => {

            const transformConv: models.Conversation = {
                id: conversation.conId,
                name: conversation.name,
                participantIds: conversation.participantIds
            }
            console.log(`this happens:`, transformConv)
            this.conParticipantsUpdated$.next(transformConv)
        })
        //notifies the self of being removed from the conv
        this._socket?.on('conParticipantRemovedResponse', (conId: any) => {
            this.conParticipantRemoved$.next(conId)
        })
        //notifies the self of being added to the conv
        this._socket?.on('conParticipantAddedResponse', (conId: any) => {
            this.conParticipantAdded$.next(conId)
        })
    }

    public updateConParticipantListRequest(conId: models.Conversation.Id, participantIds?: models.Conversation.Update): void {
        this._socket?.emit('updateConParticipantListRequest', conId, participantIds)
    }

    public disconnect(): void {
        this._socket?.disconnect()
    }
}
