import * as ngCore from '@angular/core'
import * as socketIoClient from 'socket.io-client'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models'


@ngCore.Injectable({
    providedIn: 'root',
})
export class ConSocketService {
    private _socket: socketIoClient.Socket | undefined
    private readonly _socketIOService = ngCore.inject(service.SocketIOService)

    public conParticipantsUpdated$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
    public conParticipantAdded$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()
    public conParticipantRemoved$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()
    public privateConCreated$: rxjs.Subject<models.Conversation> = new rxjs.Subject()

    constructor() {
        this.initializeSocket()
        this.setupSocketListeners()
    }

    //initialize socket connection and assign socket instance to _socket
    private initializeSocket(): void {
        if (!this._socket) {
            this._socketIOService.initializeSocketConnection()
            this._socket = this._socketIOService.getSocket()
        }
    }

    //---------------------------------------- LISTENERS ---------------------------------------//
    private setupSocketListeners(): void {

        //notifies the all current participants of the conv of additions/removals of
        //additional participants
        this._socket?.on('conParticipantListUpdatedResponse', (conversation: any) => {

            const transformConv: models.Conversation = {
                id: conversation.conId,
                name: conversation.name,
                participantIds: conversation.participantIds
            }
            this.conParticipantsUpdated$.next(transformConv)
        })
        //notifies the self of being added to the conv
        this._socket?.on('conParticipantAddedResponse', (conId: any) => {
            this.conParticipantAdded$.next(conId)
        })
        //notifies the self of being removed from the conv
        this._socket?.on('conParticipantRemovedResponse', (conId: any) => {
            this.conParticipantRemoved$.next(conId)
        })
        //notifies participant of being added to a private conversation
        this._socket?.on('privateConversationCreatedResponse', (con: any) => {
            this.privateConCreated$.next(con)
        })
    }

    //---------------------------------------- EMITTERS ---------------------------------------//
    public updateConParticipantListRequest(conId: models.Conversation.Id, participantIds?: models.Conversation.Update): void {
        this._socket?.emit('updateConParticipantListRequest', conId, participantIds)
    }

    public updateParticipantOfPrivateConCreationRequest(
        createdConversation: models.Conversation,
        addedParticipantsId: models.User.Id[]): void {
        this._socket?.emit('updateParticipantOfPrivateConCreationRequest', createdConversation, addedParticipantsId)
    }

    public disconnect(): void {
        this._socket?.disconnect()
    }
}