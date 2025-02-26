import * as ngCore from '@angular/core'
import * as models from '../../../models'
import * as commonModels from '@common/models'
import * as rxjs from 'rxjs'
import * as http from '@angular/common/http'
import * as socketService from '../socket/'

@ngCore.Injectable()
export class ConApiService {

  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _msgSocketService = ngCore.inject(socketService.MessageSocketService)
  private readonly _conSocketService = ngCore.inject(socketService.ConSocketService)
  public readonly privMsgReceived$ = new rxjs.Subject<models.Conversation.Message.InContext>()
  public readonly pubMsgReceived$ = new rxjs.Subject<models.Conversation.Message.InContext>()
  public readonly seenPrivMsgIdsReceived$ = new rxjs.Subject<models.Conversation.Message.SeenPrivateMsgsResponse>()
  public readonly seenPubMsgsIdsReceived$: rxjs.Subject<models.Conversation.Message.SeenPublicMsgsResponse> = new rxjs.Subject()
  public readonly conUpdated$ = new rxjs.Subject<commonModels.Conversation.Base>()
  public readonly conParticipantRemoved$ = new rxjs.Subject<models.Conversation.Id>()
  public readonly deletedConversation$: rxjs.Subject<models.Conversation> = new rxjs.Subject()
  public readonly conParticipantsClickedStatus$: rxjs.Subject<models.Conversation.conParticipantsClickedStatusResponse> = new rxjs.Subject()
  public readonly PubconParticipantsClickedStatus$: rxjs.Subject<models.Conversation.PubConClickedStatusResponse> = new rxjs.Subject()
  public notSelfPubMsgsSeenReceived$: rxjs.Subject<{
    conId: models.Conversation.Id
    response: models.Conversation.Message.SeenPublicMsgsResponse
  }> = new rxjs.Subject()

  private _conversationAPIurl = 'http://localhost:5000/api/conversations'
  private _messageAPIurl = 'http://localhost:5000/api/conversationMessages'
  private _participantsByConIdAPIurl = 'http://localhost:5000/api/participantsByConId'


  constructor() {
    // Subscribe to incoming private messages from the socket and push them into privMsgReceived$
    this._msgSocketService.privMessageReceived$.subscribe((message) => {
      this.privMsgReceived$.next(message)
    })
    // Subscribe to incoming public messages from the socket and push them into pubMsgReceived$
    this._msgSocketService.pubMessageReceived$.subscribe((message) => {
      this.pubMsgReceived$.next(message)
    })
    // Subscribe to updates (additions/removals) of participants in the conversation
    this._conSocketService.conParticipantsUpdated$.subscribe((con) => {
      this.conUpdated$.next(con)
    })
    //Subscribe to the removal (being kicked) of self from the conversation
    this._conSocketService.conParticipantRemoved$.subscribe((conId) => {
      this.conParticipantRemoved$.next(conId)
    })
    //Subscribe to the addition to private channel event
    this._conSocketService.privateConCreated$.subscribe((con) => {
      this.conUpdated$.next(con)
    })
    //Subscribe to the deletion of the channel
    this._conSocketService.deletedConversation$.subscribe((con) => {
      this.deletedConversation$.next(con)
    })
    //Subscribe to the self event of seeing not self's messages
    this._msgSocketService.seenMsgIdsReceived$.subscribe((result) => {
      this.seenPrivMsgIdsReceived$.next(result)
    })
    //Subscribe to the self seeing pub messages
    this._msgSocketService.seenPubMsgsIdsReceived$.subscribe((result) =>{
      this.seenPubMsgsIdsReceived$.next(result)
    })

    //Self subscrbies to the even of being notified by the server if the notself 
    //from the private conversation has clicked the private conversation or not
    this._conSocketService.privConParticipantsClickedStatus$.subscribe((result) => {
      this.conParticipantsClickedStatus$.next(result)
    })
    //Self subscrbies to the even of being notified by the server if the notselves
    //from the public conversation have clicked the public conversation 
    this._conSocketService.pubConParticipantsClickedStatus$.subscribe((result) => {
      this.PubconParticipantsClickedStatus$.next(result)
      // console.log('con-api.service/result:', result)
    })

    this._msgSocketService.notSelfPubMsgsSeenReceived$.subscribe((result) =>{
      this.notSelfPubMsgsSeenReceived$.next(result)
    })
  }

  /*-------------------- API CALLS ---------------------------*/
  /*-------------------- conversations -----------------------*/
  public getConById(id: models.Conversation.Id): rxjs.Observable<models.Conversation | undefined> {
    return this._http.get<models.Conversation | undefined>(`${this._conversationAPIurl}/${id}`)
  }
  public getAllCons(clientId: models.User.Id): rxjs.Observable<models.Conversation[]> {
    return this._http.get<models.Conversation[]>(`${this._conversationAPIurl}/${clientId}`)
  }
  public getParticipantsByConId(id: models.Conversation.Id): rxjs.Observable<commonModels.Conversation.Base> {
    return this._http.get<commonModels.Conversation.Base>(`${this._participantsByConIdAPIurl}/${id}`)
  }

  /*--------------------- SOCKET EVENTS ---------------------------*/
  /*-------------------- conversations  ---------------------------*/
  public createCon(input: models.Conversation.Input): rxjs.Observable<models.Conversation> {
    return this._http.post<models.Conversation>(`${this._conversationAPIurl}`, input).pipe(

      rxjs.tap((createdCon) => {
        if (input.participantIds == undefined) {
          throw new Error("No participantIds provided.")
        }
        this._conSocketService.updateParticipantOfPrivateConCreationRequest(createdCon, input.participantIds)
      })
    )
  }

  public updateCon(
    id: models.Conversation.Id,
    updates?: models.Conversation.Update)
    : rxjs.Observable<models.Conversation> {

    return this._http.put<models.Conversation>(`${this._conversationAPIurl}/${id}`, updates).pipe(
      rxjs.tap((updatedConversation) => {
        const conId = updatedConversation.id
        const mergeParticipants = {
          ...updates,
          participantIdsToRemove: updates?.participantIdsToRemove,
          participantIdsToAdd: updates?.participantIdsToAdd
        }
        this._conSocketService.updateConParticipantListRequest(conId, mergeParticipants)
      })
    )
  }

  public deleteCon(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
    return this._http.delete<models.Conversation>(`${this._conversationAPIurl}/${id}`).pipe(
      rxjs.tap((deletedConversation) => {
        this._conSocketService.deleteConversationRequest(deletedConversation)
      })
    )

  }

  selfClickedConId(clickedConId: models.Conversation.Id, selfId: models.User.Id):
    rxjs.Observable<models.Conversation.conParticipantsClickedStatusResponse> {
    rxjs.of(this._conSocketService.selfClickedConIdRequest(clickedConId, selfId))
    return this.conParticipantsClickedStatus$
  }

  selfClickedPubConId(clickedConId: models.Conversation.Id, selfId: models.User.Id):
  rxjs.Observable<models.Conversation.PubConClickedStatusResponse> {
  rxjs.of(this._conSocketService.selfClickedConIdRequest(clickedConId, selfId))
  return this.PubconParticipantsClickedStatus$
}

  /*-------------------- messages -----------------------*/
  //TODO: maybe move these to message-api.service.ts????
  public getConMessages(conId: models.Conversation.Id): rxjs.Observable<models.Conversation.Message[]> {
    return this._http.get<models.Conversation.Message[]>(`${this._messageAPIurl}/${conId}`)
  }
  public sendPrivConMessage(payloadMessage: models.Conversation.Message.InContext.Input):
    rxjs.Observable<models.Conversation.Message.InContext.Input> {
    this._msgSocketService.sendPrivMessage(payloadMessage)
    return this.privMsgReceived$.pipe(rxjs.take(1))
  }
  public sendPubConMessage(payloadMessage: models.Conversation.Message.InContext.Input):
    rxjs.Observable<models.Conversation.Message.InContext.Input> {
    this._msgSocketService.sendPubMessage(payloadMessage)
    return this.pubMsgReceived$.pipe(rxjs.take(1))
  }
  public sendPrivConClickedSeenRequest(conId: models.Conversation.Id, selfId: models.User.Id):
    rxjs.Observable<models.Conversation.Message.SeenPrivateMsgsResponse> {
    
    this._msgSocketService.sendPrivConClickedSeenRequest(conId, selfId)
    return this.seenPrivMsgIdsReceived$
  }
  public sendPubConClickedSeenRequest(conId: models.Conversation.Id, selfId: models.User.Id):
  rxjs.Observable<models.Conversation.Message.SeenPublicMsgsResponse> {
  this._msgSocketService.sendPubConClickedSeenRequest(conId, selfId)
  return this.seenPubMsgsIdsReceived$
}
}
/*-------------------- misc -----------------------*/
function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    )
}