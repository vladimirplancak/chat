import * as rxjs from 'rxjs'

export class AuthApiService {
  public login(username: string, password: string): rxjs.Observable<void> {
    return rxjs.timer(1000).pipe(rxjs.map(() => { }))
  }

  public generateJWT() : rxjs.Observable<{jwtToken: string}> {
    const JWT = '0'
    localStorage.setItem('jwtToken', JWT);
    return rxjs.of({jwtToken: JWT})
  }
}