import * as rxjs from 'rxjs'
import * as models from '../../../models'
import * as services from '../socket/auth-socket.service'
import * as ngCore from '@angular/core'
import * as http from '@angular/common/http'

export class AuthApiService {

  private readonly _authSocket = ngCore.inject(services.AuthSocketService)
  private readonly _http = ngCore.inject(http.HttpClient)

  private _authAPIurl = 'http://localhost:5000/api/login'

  constructor() { }

  public login(username: string, password: string): rxjs.Observable<models.Auth.Response> {
    // TODO: work on full implementation
    const payload = { username, password }
    return this._http.post<models.Auth.Response>(`${this._authAPIurl}`, payload).pipe(
      rxjs.map(response => {
        // add the token to the local storage
        models.Auth.LocalStorage.Token.set(response.jwtToken)

        // After login, initialize socket and register the user
        const decodedToken = models.Auth.Self.from(response.jwtToken)
        if (decodedToken?.userId) {
          // emit 'clientAuthenticated'event
         
          this._authSocket.clientAuthenticated(decodedToken.userId)
        }

        return {
          message: response.message,
          jwtToken: response.jwtToken
        } as models.Auth.Response
      }),
      rxjs.catchError(error => {
        return rxjs.throwError(() => error)
      })
    )
    //return rxjs.timer(1000).pipe(rxjs.map(() => AuthApiService._jwt))
  }
  public logout(selfId: string): rxjs.Observable<void> {

    models.Auth.LocalStorage.Token.set('')  // Clear the token
    return rxjs.of(void 0) 
  }
  
  /**
   * If JWT token is present in local storage, and valid, return it, otherwise return undefined
   */
  public validateJwt(): rxjs.Observable<string | undefined> {
    const token = models.Auth.LocalStorage.Token.get()

    const decodedToken = token ? models.Auth.Self.from(token) : undefined

    if (decodedToken?.userId) {
      this._authSocket.clientAuthenticated(decodedToken.userId)  // Emit 'register' here
    }
    // TODO: consider moving this "TODOs" to effect(s)
    // TODO: after we get the token, we should validate eif its valid (e.g. not expired)
    // TODO: If it expired, try refreshing it, and then validating it, if it fails, return undefined.

    return rxjs.of(token ?? undefined)
  }
}