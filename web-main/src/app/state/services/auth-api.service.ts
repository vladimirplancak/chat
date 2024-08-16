import * as rxjs from 'rxjs'

export class AuthApiService {
  public login(username: string, password: string): rxjs.Observable<void> {
    return rxjs.timer(1000).pipe(rxjs.map(() => { }))
  }
}