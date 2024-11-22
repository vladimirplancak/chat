import * as rxjs from 'rxjs'
import * as models from '../../../models'
import * as services from '../socket/'
import * as ngCore from '@angular/core'
import * as http from '@angular/common/http'

@ngCore.Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly _authSocketService = ngCore.inject(services.AuthSocketService)
  private readonly _userSocketService = ngCore.inject(services.UserSocketService)
  private readonly _http = ngCore.inject(http.HttpClient)

  private readonly _authAPIurl = 'http://localhost:5000/api/login'

  constructor() {}

  public login(username: string, password: string): rxjs.Observable<models.Auth.Response> {
    const payload = { username, password }
    return this._http.post<models.Auth.Response>(`${this._authAPIurl}`, payload).pipe(
      rxjs.map((response) => {
        // Store the token
        models.Auth.LocalStorage.Token.set(response.jwtToken)

        // Decode the token
        const decodedToken = models.Auth.Self.from(response.jwtToken)
        if (decodedToken?.userId) {
          console.log('User authenticated successfully. Setting up socket connection.')
          
          this._userSocketService.handleUserAuthenticated()
          this._authSocketService.clientAuthenticated(decodedToken.userId)
          this._userSocketService.userHasComeOnlineRequest(decodedToken.userId)
        } else {
          console.error('Invalid token. UserId not found.')
        }

        return {
          message: response.message,
          jwtToken: response.jwtToken,
        } as models.Auth.Response
      }),
      rxjs.catchError((error) => {
        console.error('Login error:', error)
        return rxjs.throwError(() => error)
      })
    )
  }

  public logout(selfId: string): rxjs.Observable<void> {
    console.log('Logging out user:', selfId)
    // clear the token
    models.Auth.LocalStorage.Token.set('')
 
    this._userSocketService.userHasWentOfflineRequest(selfId)
    this._authSocketService.clientDeauthenticated()
    this._userSocketService.handleUserDeauthenticated()
    return rxjs.of(void 0)
  }

  public validateJwt(): rxjs.Observable<string | undefined> {
    const token = models.Auth.LocalStorage.Token.get()
    const decodedToken = token ? models.Auth.Self.from(token) : undefined

    if (decodedToken?.userId) {
      console.log('Valid JWT found. Authenticating socket.')
      this._authSocketService.clientAuthenticated(decodedToken.userId)
    } else {
      console.warn('No valid JWT found.')
    }

    return rxjs.of(token ?? undefined)
  }
}
