import * as ngCore from '@angular/core';
import * as models from '../../../models';
import * as rxjs from 'rxjs'
import { IN_MEMORY_USERS_LIST } from '../api/user-api.service'
import * as http from '@angular/common/http'
import * as socketServices from '../socket/message-socket.service';

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

  private _conversationAPIurl = 'http://localhost:5000/api/conversations'
  private _messageAPIurl = 'http://localhost:5000/api/conversationMessages'
  private _participantsByConIdAPIurl = 'http://localhost:5000/api/participantsByConId'
  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _msgSocketService = ngCore.inject(socketServices.MessageSocket)

  constructor() {
    // Subscribe to incoming messages from the socket and push them into messageStream$
    this._msgSocketService.messageReceived$.subscribe((message) => {
      console.log(`Received message from server:`, message);
      this.msgReceived$.next(message);
    });
  }

  // TODO: this should be actually refactored, and should not have interaction
  // with "msgReceived$" stream at all, that part should be done through "hub"
  // methods. 
  public sendConMessage(payloadMessage: models.Conversation.Message.InContext.Input): rxjs.Observable<void> {
    console.log(`we emit the message to the server:`, payloadMessage)
    this._msgSocketService.sendMessage(payloadMessage);

    return rxjs.of()

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
  public updateConv(
    id: models.Conversation.Id,
    updates?: models.Conversation.Update)
    : rxjs.Observable<models.Conversation> {
    return this._http.put<models.Conversation>(`${this._conversationAPIurl}/${id}`, updates)
  }
  public createConv(participantIds: models.User.Id[]): rxjs.Observable<models.Conversation> {
    return this._http.post<models.Conversation>(`${this._conversationAPIurl}`, { participantIds })
  }
  public getAllConvos(): rxjs.Observable<models.Conversation[]> {
    return this._http.get<models.Conversation[]>(`${this._conversationAPIurl}`)
  }
  public getParticipantsByConId(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
    return this._http.get<models.Conversation>(`${this._participantsByConIdAPIurl}/${id}`)
  }
  public getConMessages(conId: models.Conversation.Id): rxjs.Observable<models.Conversation.Message[]> {
    return this._http.get<models.Conversation.Message[]>(`${this._messageAPIurl}/${conId}`)
  }

}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    );
}