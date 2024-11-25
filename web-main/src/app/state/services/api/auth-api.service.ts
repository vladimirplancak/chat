import * as rxjs from 'rxjs'
import * as models from '../../../models'
import * as services from '../socket/'
import * as ngCore from '@angular/core'
import * as http from '@angular/common/http'
import * as ngRouter from '@angular/router'

@ngCore.Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly _authSocketService = ngCore.inject(services.AuthSocketService)
  private readonly _userSocketService = ngCore.inject(services.UserSocketService)
  private readonly _http = ngCore.inject(http.HttpClient)
  private readonly _router = ngCore.inject(ngRouter.Router)

  private readonly _authAPIurlLogin = 'http://localhost:5000/api/login'
  private readonly _authAPIurlLogout = 'http://localhost:5000/api/logout'
  private readonly _authAPIurlRefresh = 'http://localhost:5000/api/refresh'
  constructor() { }

  public login(username: string, password: string): rxjs.Observable<models.Auth.Response> {
    const payload = { username, password }
    return this._http.post<models.Auth.Response>(`${this._authAPIurlLogin}`, payload).pipe(
      rxjs.map((response) => {
        // Store the token
        models.Auth.LocalStorage.Tokens.set(response)


        // Decode the token
        const decodedToken = models.Auth.Self.from(response.accessToken)
        if (decodedToken?.userId) {
          // console.log('User authenticated successfully. Setting up socket connection.')

          this._userSocketService.handleUserAuthenticated()
          this._authSocketService.clientAuthenticated(decodedToken.userId)
          this._userSocketService.userHasComeOnlineRequest(decodedToken.userId)
        } else {
          console.error('Invalid token. UserId not found.')
        }

        return {
          message: response.message,
          accessToken: response.accessToken,
        } as models.Auth.Response
      }),
      rxjs.catchError((error) => {
        console.error('Login error:', error)
        return rxjs.throwError(() => error)
      })
    )
  }

  public logout(selfId: string): rxjs.Observable<void> {
    // console.log('Logging out user:', selfId)
    // clear the token

    const deleteAccessToken: models.Auth.Response = {
      message: '',
      accessToken: '',
      refreshToken: models.Auth.LocalStorage.Tokens.getRefreshToken() ?? ''
    }
    models.Auth.LocalStorage.Tokens.set(deleteAccessToken)

    this._userSocketService.userHasWentOfflineRequest(selfId)
    this._authSocketService.clientDeauthenticated()
    this._userSocketService.handleUserDeauthenticated()

    return this._http.post<void>(`${this._authAPIurlLogout}/${selfId}`, {})
  }

  public validateJwt(): rxjs.Observable<string | undefined> {
    const token = models.Auth.LocalStorage.Tokens.getAccessToken()
    const decodedToken = token ? models.Auth.Self.from(token) : undefined

    if (decodedToken?.userId) {
      // console.log('Valid JWT found. Authenticating socket.')
      this._authSocketService.clientAuthenticated(decodedToken.userId)
    } else {
      console.warn('No valid JWT found.')
    }

    return rxjs.of(token ?? undefined)
  }

  public handleTokenExpiry(): void {
    const token = models.Auth.LocalStorage.Tokens.getAccessToken()
    if (!token) {
      console.warn('No token found for expiration handling.')
      return
    }
    const decodedToken = models.Auth.Self.from(token)
    if (!decodedToken) {
      console.error('Invalid token: Unable to decode for expiration handling.')
      return
    }

    const expDate = models.Auth.LocalStorage.Tokens.TokenExpDate()
    const currentTime = Date.now()
    const timeout = expDate - currentTime

    if (timeout <= 0) {
      console.warn('Token has already expired.Attemting to refresh.')
      this.refreshJwt().subscribe((response) => {
        if (response) {
          console.log('Access token refreshed successfully. Restarting the expiration time.')
          this.handleTokenExpiry()
        } else {
          console.warn('No valid refresh token. Disconnecting the user')
          this.logout(decodedToken.userId).subscribe(() => {
            this._router.navigate(['/login'])
          })
        }
      })
      return
    }

    console.log(`Token will expire in ${timeout} ms.`)
    setTimeout(() => {
      console.log('Access token expired. Attempting the refresh.')
      this.refreshJwt().subscribe((response) => {
        if (response) {
          console.log('Access token has been refreshed. Timer reset.')
          this.handleTokenExpiry()
        } else {
          console.log('Your session has expired. Disconnecting...')
          this.logout(decodedToken.userId).subscribe(() => {
            this._router.navigate(['/login'])
          })
        }
      })
    }, timeout)
  }

  public refreshJwt(): rxjs.Observable<models.Auth.Response | null> {
    const refreshToken = models.Auth.LocalStorage.Tokens.getRefreshToken()
    if (!refreshToken) {
      console.warn('No refresh token found.')
      return rxjs.of(null)
    }

    return this._http.post<models.Auth.Response>(`${this._authAPIurlRefresh}`, { refreshToken }).pipe(
      rxjs.map((response) => {
        response.refreshToken = refreshToken //renew the token if its valid
        console.log(`response is:`, response)
        models.Auth.LocalStorage.Tokens.set(response)
        console.log('JWT token refreshed successfully.')
        return response
      }),
      rxjs.catchError((error) => {
        console.error('Failed to refresh JWT token:', error)
        const deleteBothTokens: models.Auth.Response = {
          message: '',
          accessToken: '',
          refreshToken: ''
        }
        models.Auth.LocalStorage.Tokens.set(deleteBothTokens)
        return rxjs.of(null)
      })
    )
  }

}
