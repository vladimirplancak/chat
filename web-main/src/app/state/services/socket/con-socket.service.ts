import * as ngCore from '@angular/core'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models'
import { Socket } from 'socket.io-client'

@ngCore.Injectable({
    providedIn: 'root',
})
export class ConSocketService implements ngCore.OnDestroy {

    ngOnDestroy(): void {
        this._destroySubscription$.next()
        this._destroySubscription$.complete()
    }
    private readonly _socketIOService = ngCore.inject(service.SocketIOService)
    private readonly _destroySubscription$ = new rxjs.Subject<void>()
    private _connectedSocket$ = this._socketIOService.onSocketConnected()
        .pipe(
            rxjs.shareReplay(1),
            rxjs.takeUntil(this._destroySubscription$)
        )

    public conParticipantsUpdated$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
    public conParticipantAdded$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()
    public conParticipantRemoved$: rxjs.Subject<models.Conversation.Id> = new rxjs.Subject()
    public privateConCreated$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
    public deletedConversation$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
    constructor() {
        //console.log(`ConSocketService initialized.`)
        this.setupSocketListeners()
    }


    //---------------------------------------- LISTENERS ---------------------------------------//
    private setupSocketListeners(): void {
        this._connectedSocket$.subscribe(() => {
            const socket = this._socketIOService.getSocket()
            if (socket) {
                // console.log('Socket connected. Setting up listeners.')
                this.registerSocketListeners(socket)
            } else {
                console.error('Socket instance is undefined.')
            }
        })
    }



    private registerSocketListeners(socket: Socket): void {
        //notifies the all current participants of the conv of additions/removals of
        //additional participants
        socket.on('conParticipantListUpdatedResponse', (conversation: any) => {

            const transformConv: models.Conversation = {
                id: conversation.conId,
                name: conversation.name,
                participantIds: conversation.participantIds,
                creatorId: conversation.creatorId
            }
            this.conParticipantsUpdated$.next(transformConv)
        })
        //notifies the self of being added to the conv
        socket.on('conParticipantAddedResponse', (conId: any) => {
            this.conParticipantAdded$.next(conId)
        })
        //notifies the self of being removed from the conv
        socket.on('conParticipantRemovedResponse', (conId: any) => {
            this.conParticipantRemoved$.next(conId)
        })
        //notifies participant of being added to a private conversation
        socket.on('privateConversationCreatedResponse', (con: any) => {
            this.privateConCreated$.next(con)
        })
        //notifies all of the participants of the deleted conversation
        socket.on('deleteCoversationResponse', (con: any) => {
            this.deletedConversation$.next(con)
        })
    }

    //---------------------------------------- EMITTERS ---------------------------------------//
    public updateConParticipantListRequest(conId: models.Conversation.Id, participantIds?: models.Conversation.Update): void {
        this._connectedSocket$.pipe(
            rxjs.tap(() => {
                const socket = this._socketIOService.getSocket()
                if (socket) {
                    socket.emit('updateConParticipantListRequest', conId, participantIds)
                } else {
                    console.error('Socket instance is undefined. Cannot emit participant list update request.')
                }
            })
        ).subscribe()
    }
    public updateParticipantOfPrivateConCreationRequest(
        createdConversation: models.Conversation,
        addedParticipantsId: models.User.Id[]): void {
        this._connectedSocket$.pipe(
            rxjs.tap(() => {
                const socket = this._socketIOService.getSocket()
                if (socket) {
                    socket.emit('updateParticipantOfPrivateConCreationRequest', createdConversation, addedParticipantsId)
                } else {
                    console.error('Socket instance is undefined. Cannot emit participant added to created con request.')
                }
            })
        ).subscribe()
    }
    public deleteConversationRequest(deletedConversation: models.Conversation) {
        this._connectedSocket$.pipe(
            rxjs.tap(() => {
                const socket = this._socketIOService.getSocket()
                if (socket) {
                    socket.emit('deleteCoversationRequest', deletedConversation)
                } else {
                    console.error('Socket instance is undefined. Cannot emit conversation deleted request.')
                }
            })
        ).subscribe()
    }
    public disconnect(): void {
        this._connectedSocket$.subscribe(() => {
            const socket = this._socketIOService.getSocket()
            socket?.disconnect()
        })
    }
}
