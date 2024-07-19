import * as ngCore from '@angular/core';
import * as models from '../../models';
import * as rxjs from 'rxjs'

const IN_MEMORY_CONVO_LIST: models.Conversation[] = [
    { id: '0', name: 'conv-one' },
    { id: '1', name: 'conv-two' },
    { id: '2', name: 'conv-three' },
    { id: '3', name: 'conv-four' },
]

@ngCore.Injectable()

export class ChannelApiService {

    public list(): rxjs.Observable<readonly models.Conversation[]> {
        return rxjs.of(IN_MEMORY_CONVO_LIST).pipe(randomDelayOperator())
    }

    public get(id: models.Conversation.Id): rxjs.Observable<models.Conversation | undefined> {
        const foundConvo = IN_MEMORY_CONVO_LIST.find(it => it.id === id)
        return rxjs.of(foundConvo ? { ...foundConvo } : undefined).pipe(randomDelayOperator())
    }

    public create(input: models.Conversation.Input): rxjs.Observable<models.Conversation> {
        const newConvo = { id: IN_MEMORY_CONVO_LIST.length.toString(), ...input }

        IN_MEMORY_CONVO_LIST.push(newConvo)

        return rxjs.of({ ...newConvo }).pipe(randomDelayOperator())
    }


    public update(id: models.Conversation.Id, updates: models.Conversation.Update): rxjs.Observable<models.Conversation> {
        const foundConvo = IN_MEMORY_CONVO_LIST.find(it => it.id === id)

        if (!foundConvo) {
            throw new Error('Conversation not found')
        }

        Object.assign(foundConvo, updates)

        return rxjs.of({ ...foundConvo }).pipe(randomDelayOperator())
    }


    public delete(id: models.Conversation.Id): rxjs.Observable<models.Conversation> {
        const index = IN_MEMORY_CONVO_LIST.findIndex(it => it.id === id)

        const oldConvo = IN_MEMORY_CONVO_LIST[index]

        if (index !== -1) {
            IN_MEMORY_CONVO_LIST.splice(index, 1)
        }

        return rxjs.of(oldConvo).pipe(randomDelayOperator())
    }
    
}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
    return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
      source.pipe(
        rxjs.delay(Math.random() * 2500),
      );
  }