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

const IN_MEMORY_MSG_LIST: Partial<Record<models.Conversation.Id, readonly models.Conversation.Message[]>> = {
  '0': [
    { content: 'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of "de Finibus Bonorum et Malorum" (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, "Lorem ipsum dolor sit amet..", comes from a line in section 1.10.32.', datetime: _incrementDate(now, 1), id: '0', userId: IN_MEMORY_CON_LIST[0].participantIds[0] },
    { content: 'con 1 - Hello message 2', datetime: _incrementDate(now, 1), id: '1', userId: IN_MEMORY_CON_LIST[0].participantIds[0] },
    { content: 'con 1 - Hello message 3', datetime: _incrementDate(now, 1), id: '2', userId: IN_MEMORY_CON_LIST[0].participantIds[1] },
    { content: 'con 1 - Hello message 4', datetime: _incrementDate(now, 1), id: '3', userId: IN_MEMORY_CON_LIST[0].participantIds[1] },
    { content: 'con 1 - Hello message 5', datetime: _incrementDate(now, 1), id: '4', userId: IN_MEMORY_CON_LIST[0].participantIds[1] },

  ],
  '1': [
    { content: 'con 2 - Hello message 1', datetime: _incrementDate(now, 1), id: '5', userId: IN_MEMORY_CON_LIST[1].participantIds[0] },
    { content: 'con 2 - Hello message 2', datetime: _incrementDate(now, 1), id: '6', userId: IN_MEMORY_CON_LIST[1].participantIds[0] },
    { content: 'con 2 - Hello message 3', datetime: _incrementDate(now, 1), id: '7', userId: IN_MEMORY_CON_LIST[1].participantIds[1] },
    { content: 'con 2 - Hello message 4', datetime: _incrementDate(now, 1), id: '8', userId: IN_MEMORY_CON_LIST[1].participantIds[1] },
    { content: 'con 2 - Hello message 5', datetime: _incrementDate(now, 1), id: '9', userId: IN_MEMORY_CON_LIST[1].participantIds[1] },
  ],
  '2': [],
  '3': [],
}

@ngCore.Injectable()
export class ConApiService {
  public readonly msgReceived$ = new rxjs.Subject<models.Conversation.Message.InContext>()
  public readonly messageStream$ = new rxjs.BehaviorSubject<models.Conversation.Message.InContext | null>(null);

  private _conversationAPIurl = 'http://localhost:5000/api/conversations'
  private _messageAPIurl = 'http://localhost:5000/api/conversationMessages'
  private _participantsByConIdAPIurl ='http://localhost:5000/api/participantsByConId' 
  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _socketService = ngCore.inject(socketServices.MessageSocket)

  constructor() {
    // Subscribe to incoming messages from the socket and push them into messageStream$
    this._socketService.messageReceived$.subscribe((message) => {
      console.log(`Received message from server:`, message);
      this.messageStream$.next(message);
    });
  }
  
  // TODO: this should be actually refactored, and should not have interaction
  // with "msgReceived$" stream at all, that part should be done through "hub"
  // methods. 
  public sendConMessage(payloadMessage: models.Conversation.Message.InContext.Input): rxjs.Observable<void> {
    console.log(`we emit the message to the server:`, payloadMessage)
    this._socketService.sendMessage(payloadMessage);
    return rxjs.of()
    // const messageList = IN_MEMORY_MSG_LIST[payloadMessage.conId];

    // if (!messageList) {
    //   throw new Error('Message doesn\'t exist in cache')
    // }

    // const newCachedId = (messageList.length + 1).toString()

    // // Simulate, that we send message to the server, and then we receive it back 
    // return rxjs.timer(1000).pipe(rxjs.map(() => {
    //   this.msgReceived$.next({ ...payloadMessage, id: newCachedId })
    // }))
  }
  public getMessageStream(): rxjs.Observable<models.Conversation.Message.InContext | null> {
    return this.messageStream$.asObservable();
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
  public createConv(participantIds: models.User.Id[]): rxjs.Observable<models.Conversation>{
    return this._http.post<models.Conversation>(`${this._conversationAPIurl}`,{participantIds})
  }
  public getAllConvos(): rxjs.Observable<models.Conversation[]> {
    return this._http.get<models.Conversation[]>(`${this._conversationAPIurl}`)
  }
  public getParticipantsByConId(id: models.Conversation.Id): rxjs.Observable<models.Conversation>{
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