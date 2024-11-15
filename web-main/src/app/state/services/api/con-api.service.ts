import * as ngCore from '@angular/core';
import * as models from '../../../models';
import * as rxjs from 'rxjs'
import { IN_MEMORY_USERS_LIST } from '../api/user-api.service'
import * as http from '@angular/common/http'
import * as messageSocket from '../socket/message-socket.service';
import * as convSocket from '../socket/con-socket.service';
let now = new Date()

function _incrementDate(date: Date, seconds: number): Date {
  const newDate = new Date(date.getTime() + seconds * 1000)
  now = newDate
  return newDate
}

_incrementDate(now, 1)



let IN_MEMORY_CON_LIST: models.Conversation[] = [
  { id: '0', name: 'con-one', participantIds: [...IN_MEMORY_USERS_LIST].splice(0, 5).map(it => it.id) },
  { id: '1', name: 'con-two', participantIds: [...IN_MEMORY_USERS_LIST].splice(5, 5).map(it => it.id) },
  { id: '2', name: 'con-three', participantIds: [...IN_MEMORY_USERS_LIST].splice(10, 5).map(it => it.id) },
  { id: '3', name: 'con-four', participantIds: [...IN_MEMORY_USERS_LIST].splice(15, 5).map(it => it.id) },
]


@ngCore.Injectable()
export class ConApiService {
  public readonly msgReceived$ = new rxjs.Subject<models.Conversation.Message.InContext>()
  public readonly conUpdated$ = new rxjs.Subject<models.Conversation>()
  public readonly conParticipantRemoved$ = new rxjs.Subject<models.Conversation.Id>()
  

  private _conversationAPIurl = 'http://localhost:5000/api/conversations'
  private _messageAPIurl = 'http://localhost:5000/api/conversationMessages'
  private _participantsByConIdAPIurl = 'http://localhost:5000/api/participantsByConId'
  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _msgSocketService = ngCore.inject(messageSocket.MessageSocket)
  private readonly _conSocketService = ngCore.inject(convSocket.ConSocket)

  constructor() {
    // Subscribe to incoming messages from the socket and push them into messageStream$
    this._msgSocketService.messageReceived$.subscribe((message) => {
      this.msgReceived$.next(message);
    });
    // Subscribe to updates (additions/removals) of participants in the conversation
    this._conSocketService.conParticipantsUpdated$.subscribe((con)=>{
      this.conUpdated$.next(con)
    })
    //Subscribe to the removal (being kicked) of self from the conversation
    this._conSocketService.conParticipantRemoved$.subscribe((conId) =>{
      this.conParticipantRemoved$.next(conId)
    })
    //Subscribe to the addition to private channel event
    this._conSocketService.privateConCreated$.subscribe((con) =>{
      this.conUpdated$.next(con)
    })
  }

  //TODO: investigate how exactly does this work and refactor it.
  public getCon(id: models.Conversation.Id): rxjs.Observable<models.Conversation | undefined> {
    const foundCon = IN_MEMORY_CON_LIST.find(it => it.id === id)
    return rxjs.of(foundCon ? { ...foundCon } : undefined).pipe(randomDelayOperator())
  }


  public deleteCon(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
    const index = IN_MEMORY_CON_LIST.findIndex(it => it.id === id)

    const oldCon = IN_MEMORY_CON_LIST[index]

    if (index !== -1) {
      IN_MEMORY_CON_LIST.splice(index, 1)
    }

    return rxjs.of(oldCon).pipe(randomDelayOperator())
  }

  /*-------------------- API CALLS ---------------------------*/
  /*-------------------- conversations -----------------------*/
  public getAllCons(clientId: models.User.Id): rxjs.Observable<models.Conversation[]> {
    return this._http.get<models.Conversation[]>(`${this._conversationAPIurl}/${clientId}`, )
  }
  public getParticipantsByConId(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
    return this._http.get<models.Conversation>(`${this._participantsByConIdAPIurl}/${id}`)
  }
  public createCon(participantIds: models.User.Id[]): rxjs.Observable<models.Conversation> {
    return this._http.post<models.Conversation>(`${this._conversationAPIurl}`, { participantIds }).pipe(
      
      rxjs.tap((createdCon)=>{
        this._conSocketService.updateParticipantOfPrivateConCreationRequest(createdCon, participantIds)
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
       
        const mergeParticipants ={
          ...updates,
          participantIdsToRemove: updates?.participantIdsToRemove ,
          participantIdsToAdd: updates?.participantIdsToAdd
        }
     
        this._conSocketService.updateConParticipantListRequest(conId,mergeParticipants)
      })
    )
  }
  /*-------------------- messages -----------------------*/
  public getConMessages(conId: models.Conversation.Id): rxjs.Observable<models.Conversation.Message[]> {
    return this._http.get<models.Conversation.Message[]>(`${this._messageAPIurl}/${conId}`)
  }
  public sendConMessage(payloadMessage: models.Conversation.Message.InContext.Input): rxjs.Observable<void> {
    this._msgSocketService.sendMessage(payloadMessage);
    return rxjs.of()
  }
}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    );
}