import * as ngCore from '@angular/core';
import * as models from '../../../models';
import * as rxjs from 'rxjs'
import * as http from '@angular/common/http'
import * as socketService from '../socket/message-socket.service';

export const IN_MEMORY_USERS_LIST: models.User[] = [
  { id: '0', name: 'Alice' },
  { id: '1', name: 'Bob' },
  { id: '2', name: 'Charlie' },
  { id: '3', name: 'David' },
  { id: '4', name: 'Eve' },
  { id: '5', name: 'Frank' },
  { id: '6', name: 'Grace' },
  { id: '7', name: 'Heidi' },
  { id: '8', name: 'Ivan' },
  { id: '9', name: 'Judy' },
  { id: '10', name: 'Karl' },
  { id: '11', name: 'Linda' },
  { id: '12', name: 'Hitler' },
  { id: '13', name: 'Mao' },
  { id: '14', name: 'Stalin' },
  { id: '15', name: 'Trump' },
  { id: '16', name: 'Biden' },
  { id: '17', name: 'Putin' },
  { id: '18', name: 'Xi' },
  { id: '19', name: 'Kim' },
  { id: '20', name: 'Merkel' },
]

@ngCore.Injectable()
export class UserApiService {
  private _apiUrl = 'http://localhost:5000/api/users'
  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _socketService = ngCore.inject(socketService.MessageSocket)

  public readonly userCameOnline$ = new rxjs.Subject<models.User.Id>()
  public readonly userWentOffline$ = new rxjs.Subject<models.User.Id>()

  constructor() {
    // TODO: remove this hardcoded online / offline approach once implementing backend
    rxjs.timer(0, 500).subscribe(() => {
      const randomOnlineUser = IN_MEMORY_USERS_LIST[Math.floor(Math.random() * IN_MEMORY_USERS_LIST.length)]
      const randomOfflineUser = IN_MEMORY_USERS_LIST[Math.floor(Math.random() * IN_MEMORY_USERS_LIST.length)]

      //  this.userCameOnline$.next(randomOnlineUser.id)
      //  this.userWentOffline$.next(randomOfflineUser.id)
    })
    
      //socketIO
      
      // this._socket = io('http://localhost:5000/', {

      //   withCredentials: true,
      // });
      // this._socket.on('connect', () => {
      //   console.log('Socket connected');
      // });
  }
  /*-------------------- API CALLS ---------------------------*/
  public getAllUsers(): rxjs.Observable<models.User[]> {
    return this._http.get<models.User[]>(`${this._apiUrl}`)
  }
  

  public list(): rxjs.Observable<readonly models.User[]> {
    return rxjs.of(IN_MEMORY_USERS_LIST).pipe(randomDelayOperator())
  }

  public get(id: models.User.Id): rxjs.Observable<models.User | undefined> {
    const foundUser = IN_MEMORY_USERS_LIST.find(it => it.id === id)
    return rxjs.of(foundUser ? { ...foundUser } : undefined).pipe(randomDelayOperator())
  }

  public create(input: models.User.Input): rxjs.Observable<models.User> {
    const newUser = { id: IN_MEMORY_USERS_LIST.length.toString(), ...input }

    IN_MEMORY_USERS_LIST.push(newUser)

    return rxjs.of({ ...newUser }).pipe(randomDelayOperator())
  }

  public update(id: models.User.Id, updates: models.User.Update): rxjs.Observable<models.User> {
    const foundUser = IN_MEMORY_USERS_LIST.find(it => it.id === id)

    if (!foundUser) {
      throw new Error('User not found')
    }

    Object.assign(foundUser, updates)

    return rxjs.of({ ...foundUser }).pipe(randomDelayOperator())
  }

  public delete(id: models.User.Id): rxjs.Observable<models.User> {
    const index = IN_MEMORY_USERS_LIST.findIndex(it => it.id === id)

    const oldUser = IN_MEMORY_USERS_LIST[index]

    if (index !== -1) {
      IN_MEMORY_USERS_LIST.splice(index, 1)
    }

    return rxjs.of(oldUser).pipe(randomDelayOperator())
  }




}

function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    );
}
