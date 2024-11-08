import * as rxjs from 'rxjs'
import * as models from '../../../models'
import * as socketServices from '../socket/auth-socket.service'
import * as ngCore from '@angular/core'

export class AuthApiService {
  // TODO: The setting of jwt token should go away from here.
  private  static readonly _jwt: string = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE3MzA4MTg1NDEsImV4cCI6MTc2MjM1NDU0MSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoianJvY2tldEBleGFtcGxlLmNvbSIsInVzZXJJZCI6IkZFQUIwNjIyLTk5QTAtNEI5OS1CREMxLUI5QUYyQTBFN0M4MyJ9.Y8-lrBXgsVkqFbopXjBgqeUlpT_D2YQ6Ab-bstfbLMQ'
  private readonly _authSocket = ngCore.inject(socketServices.AuthSocket)

  constructor() {
    // TODO: remove this after full implementation  
    models.Auth.LocalStorage.Token.set(AuthApiService._jwt)
  }

  public login(username: string, password: string): rxjs.Observable<string> {
    // TODO: work on full implementation
    return rxjs.timer(1000).pipe(rxjs.map(() => AuthApiService._jwt))
  }

  /**
   * If JWT token is present in local storage, and valid, return it, otherwise return undefined
   */
  public validateJwt() : rxjs.Observable<string | undefined> {
    const token = models.Auth.LocalStorage.Token.get()
    
    const decodedToken = token ? models.Auth.Self.from(token) : undefined

    if (decodedToken?.userId) {
      this._authSocket.register(decodedToken.userId)  // Emit 'register' here
    }
    // TODO: consider moving this "TODOs" to effect(s)
    // TODO: after we get the token, we should validate eif its valid (e.g. not expired)
    // TODO: If it expired, try refreshing it, and then validating it, if it fails, return undefined.

    return rxjs.of(token ?? undefined)
  }
}