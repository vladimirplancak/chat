import * as ngCore from '@angular/core';
import * as models from '../../models';
import * as rxjs from 'rxjs'
import { IN_MEMORY_USERS_LIST } from './user-api.service'

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

  // TODO: this should be actually refactored, and should not have interaction
  // with "msgReceived$" stream at all, that part should be done through "hub"
  // methods. 
  public sendConMessage(payloadMessage: models.Conversation.Message.InContext.Input): rxjs.Observable<void> {
    
    const messageList = IN_MEMORY_MSG_LIST[payloadMessage.conId];
    
    if(!messageList) {
      throw new Error('Message doesn\'t exist in cache')
    }

    const newCachedId = (messageList.length + 1).toString()

    // Simulate, that we send message to the server, and then we receive it back 
    return rxjs.timer(1000).pipe(rxjs.map(() => { 
      this.msgReceived$.next({ ...payloadMessage, id: newCachedId })  
    }))
  }

  public conList(): rxjs.Observable<readonly models.Conversation[]> {
    return rxjs.of(IN_MEMORY_CON_LIST).pipe(randomDelayOperator())
  }

  public getCon(id: models.Conversation.Id): rxjs.Observable<models.Conversation | undefined> {
    const foundCon = IN_MEMORY_CON_LIST.find(it => it.id === id)
    return rxjs.of(foundCon ? { ...foundCon } : undefined).pipe(randomDelayOperator())
  }

  public createCon(input: models.Conversation.Input): rxjs.Observable<models.Conversation> {
    input = {
      ...input
    }
    // consider this as direct message
    if(!input.name && input.participantIds.length === 2) {
      // TODO: should get actual user names, rather then ids
      input.name = `${input.participantIds[0]}-${input.participantIds[1]}`
    }
    const newCon = { id: IN_MEMORY_CON_LIST.length.toString(), ...input }
    
    IN_MEMORY_CON_LIST = [...IN_MEMORY_CON_LIST, newCon];
    //IN_MEMORY_CON_LIST.push(newCon)

    return rxjs.of({ ...newCon }).pipe(randomDelayOperator())
  }

  public updateCon(
    id: models.Conversation.Id, 
    updates: models.Conversation.Update
  ): rxjs.Observable<models.Conversation> {
    const foundCon = IN_MEMORY_CON_LIST.find(it => it.id === id);
    console.log(`foundCon:`, foundCon);
    console.log(`updates:`, updates);
  
    if (!foundCon) {
      throw new Error('conversation not found');
    }
  
    
    const mergedParticipantIds = updates.participantIds?.length
      ? [...new Set([...foundCon.participantIds, ...updates.participantIds])]
      : foundCon.participantIds;
  
    
    const updatedCon = {
      ...foundCon, 
      ...updates,
      participantIds: mergedParticipantIds, 
    };
  
    IN_MEMORY_CON_LIST = IN_MEMORY_CON_LIST.map(con => 
      con.id === id ? updatedCon : con
    );
  
    console.log(`updatedCon:`, updatedCon);  
  
    return rxjs.of({ ...updatedCon }).pipe(randomDelayOperator());
  }
  
  

  

  public deleteCon(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
    const index = IN_MEMORY_CON_LIST.findIndex(it => it.id === id)

    const oldCon = IN_MEMORY_CON_LIST[index]

    if (index !== -1) {
      IN_MEMORY_CON_LIST.splice(index, 1)
    }

    return rxjs.of(oldCon).pipe(randomDelayOperator())
  }

  public listConMessages(conId: models.Conversation.Id): rxjs.Observable<readonly models.Conversation.Message[]> {
    const foundMsgs = [...(IN_MEMORY_MSG_LIST[conId] ?? [])]

    return rxjs.of(foundMsgs).pipe(randomDelayOperator())
  }

}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    );
}