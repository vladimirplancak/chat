import * as ngCore from '@angular/core';
import * as models from '../../../models';
import * as rxjs from 'rxjs'
import * as http from '@angular/common/http'

@ngCore.Injectable()
export class UserApiService {
  private readonly _http = ngCore.inject(http.HttpClient)
  
  private _apiUrl = 'http://localhost:5000/api/users'

  public readonly userCameOnline$ = new rxjs.Subject<models.User.Id>()
  public readonly userWentOffline$ = new rxjs.Subject<models.User.Id>()

  constructor() {
    // TODO: remove this hardcoded online / offline approach once implementing backend
    // rxjs.timer(0, 500).subscribe(() => {
    //   const randomOnlineUser = IN_MEMORY_USERS_LIST[Math.floor(Math.random() * IN_MEMORY_USERS_LIST.length)]
    //   const randomOfflineUser = IN_MEMORY_USERS_LIST[Math.floor(Math.random() * IN_MEMORY_USERS_LIST.length)]

    //   //  this.userCameOnline$.next(randomOnlineUser.id)
    //   //  this.userWentOffline$.next(randomOfflineUser.id)
    // })
  }

  /*-------------------- API CALLS ---------------------------*/
  public getUserById(id: models.User.Id): rxjs.Observable<models.User | undefined> {
    return this._http.get<models.User | undefined>(`${this._apiUrl}/${id}`)
  }
  public getAllUsers(): rxjs.Observable<models.User[]> {
    return this._http.get<models.User[]>(`${this._apiUrl}`)
  }
  public create(input: models.User.Input): rxjs.Observable<models.User> {
    return this._http.post<models.User>(`${this._apiUrl}`, input)
  }
  public update(id: models.User.Id, updates: models.User.Update): rxjs.Observable<models.User> {
    return this._http.put<models.User>(`${this._apiUrl}/${id}`, updates)
  }
  public delete(id: models.User.Id): rxjs.Observable<models.User> {
    return this._http.delete<models.User>(`${this._apiUrl}/${id}`)
  }
}
/*-------------------- misc -----------------------*/
function randomDelayOperator<T>(): rxjs.OperatorFunction<T, T> {
  return (source: rxjs.Observable<T>): rxjs.Observable<T> =>
    source.pipe(
      rxjs.delay(Math.random() * 2500),
    );
}
