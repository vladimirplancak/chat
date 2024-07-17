import * as ngCore from '@angular/core';
import * as models from '../../models';
import * as rxjs from 'rxjs'


const IN_MEMORY_USERS_LIST: models.User[] = [
  { id: '0', name: 'Alice' },
  { id: '1', name: 'Bob' },
  { id: '2', name: 'Charlie' },
  { id: '3', name: 'David' },
]

@ngCore.Injectable()
export class UserApiService {
  public list(): rxjs.Observable<readonly models.User[]> {
    return rxjs.of(IN_MEMORY_USERS_LIST).pipe(randomDelayOperator())
  }

  public get(id: models.User.Id): rxjs.Observable<models.User | undefined> {
    const foundUser = IN_MEMORY_USERS_LIST.find(it => it.id === id)
    return rxjs.of(foundUser ? {...foundUser} : undefined).pipe(randomDelayOperator())
  }

  public create(input: models.User.Input): rxjs.Observable<models.User> {
    const newUser = { id: IN_MEMORY_USERS_LIST.length.toString(), ...input }

    IN_MEMORY_USERS_LIST.push(newUser)

    return rxjs.of({...newUser}).pipe(randomDelayOperator())
  }

  public update(id: models.User.Id, updates: models.User.Update): rxjs.Observable<models.User> {
    const foundUser = IN_MEMORY_USERS_LIST.find(it => it.id === id)

    if(!foundUser) {
      throw new Error('User not found')
    }

    Object.assign(foundUser, updates)

    return rxjs.of({ ...foundUser }).pipe(randomDelayOperator())
  }

  public delete(id: models.User.Id): rxjs.Observable<models.User> {
    const index = IN_MEMORY_USERS_LIST.findIndex(it => it.id === id)

    const oldUser = IN_MEMORY_USERS_LIST[index]

    if(index !== -1) {
      IN_MEMORY_USERS_LIST.splice(index, 1)
    }

    return rxjs.of(oldUser).pipe(randomDelayOperator())
  }  

}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(10000),
    );
}
