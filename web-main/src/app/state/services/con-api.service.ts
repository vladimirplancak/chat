import * as ngCore from '@angular/core';
import * as models from '../../models';
import * as rxjs from 'rxjs'

const IN_MEMORY_CON_LIST: models.Conversation[] = [
    { id: '0', name: 'con-one', participantIds: [] },
    { id: '1', name: 'con-two', participantIds: [] },
    { id: '2', name: 'con-three', participantIds: [] },
    { id: '3', name: 'con-four', participantIds: [] },
]

@ngCore.Injectable()

export class ConApiService {

    public list(): rxjs.Observable<readonly models.Conversation[]> {
        return rxjs.of(IN_MEMORY_CON_LIST).pipe(randomDelayOperator())
    }

    public get(id: models.Conversation.Id): rxjs.Observable<models.Conversation | undefined> {
        const foundCon = IN_MEMORY_CON_LIST.find(it => it.id === id)
        return rxjs.of(foundCon ? { ...foundCon } : undefined).pipe(randomDelayOperator())
    }

    public create(input: models.Conversation.Input): rxjs.Observable<models.Conversation> {
        const newCon = { id: IN_MEMORY_CON_LIST.length.toString(), ...input }

        IN_MEMORY_CON_LIST.push(newCon)

        return rxjs.of({ ...newCon }).pipe(randomDelayOperator())
    }


    public update(id: models.Conversation.Id, updates: models.Conversation.Update): rxjs.Observable<models.Conversation> {
        const foundCon = IN_MEMORY_CON_LIST.find(it => it.id === id)

        if (!foundCon) {
            throw new Error('Conversation not found')
        }

        Object.assign(foundCon, updates)

        return rxjs.of({ ...foundCon }).pipe(randomDelayOperator())
    }


    public delete(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
        const index = IN_MEMORY_CON_LIST.findIndex(it => it.id === id)

        const oldCon = IN_MEMORY_CON_LIST[index]

        if (index !== -1) {
            IN_MEMORY_CON_LIST.splice(index, 1)
        }

        return rxjs.of(oldCon).pipe(randomDelayOperator())
    }
    
}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
    return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
      source.pipe(
        rxjs.delay(Math.random() * 2500),
      );
  }