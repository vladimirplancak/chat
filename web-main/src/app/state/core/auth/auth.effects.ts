import * as ngCore from '@angular/core'
import * as ngrxEffects from '@ngrx/effects'
import { Action } from '@ngrx/store'
import * as actions from './auth.actions'
import * as rxjs from 'rxjs'
import * as services from '../../services'
import * as ngRouter from '@angular/router'
import * as ngrxStore from '@ngrx/store'
import * as selectors from './auth.selectors'
@ngCore.Injectable()
export class AuthEffects implements ngrxEffects.OnInitEffects {
  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _authApiService = ngCore.inject(services.AuthApiService)
  private readonly _router = ngCore.inject(ngRouter.Router)
  private readonly _store = ngCore.inject(ngrxStore.Store)
  /**
   * When the application loads, this effect will execute exactly once, and it
   * will trigger / dispatch 'localAuthStarted' action.
   */
  initialized$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Auth.Misc.actions.initialized),
      rxjs.map(() => actions.Auth.Misc.actions.localAuthStarted())
    )
  )

  /**
   * When 'localAuthStarted' action is dispatched, we need to check if the token
   * that we have "cached" in the localStorage is valid, and is ready to be
   * used.
   */
  localAuthStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Misc.actions.localAuthStarted),
    rxjs.switchMap(() => this._authApiService.validateJwt()),
    rxjs.map((possibleJwtToken) =>
      // NOTE: If we have JWT token, after we "validate it", consider that
      // localAuthSucceeded, otherwise consider it failed.
      possibleJwtToken
        ? actions.Auth.Misc.actions.localAuthSucceeded({ jwtToken: possibleJwtToken })
        : actions.Auth.Misc.actions.localAuthFailed()
    )
  ))

  localAuthFailed$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Misc.actions.localAuthFailed),
    rxjs.map(() => {
      // TODO: redirect to login page
      // this._router.navigate(['/login'])
      this._router.navigate(['/login'])
     // throw new Error('Local authentication failed')
    })
  ), { dispatch: false })


  /**
   * When the user submits the login form, we want to start the login process.
   */
  onFormSubmitted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Ui.LoginForm.actions.submitted),
    rxjs.map((action) => actions.Auth.Api.actions.started(action))
  ))
 /**
   * When the user submits the logout request, we want to start the logout process.
   */
 onLogoutRequestClicked$ = ngrxEffects.createEffect(() => 
  this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Ui.Buttons.LogOut.actions.started),
    rxjs.withLatestFrom(this._store.select(selectors.Auth.SELF_ID)),
    
    rxjs.switchMap(([action, selfId]) => {
      if (!selfId) {
        throw new Error("Self doesn't exist")
      }
      return this._authApiService.logout(selfId).pipe(
        rxjs.map(() => actions.Auth.Ui.Buttons.LogOut.actions.succeeded()),
        rxjs.catchError(error => {
          const errorMessage = error?.error?.message || 'Logout request failed'
          return rxjs.of(actions.Auth.Ui.Buttons.LogOut.actions.failed({ errorMessage }))
        })
      )
    })
  )
)
/**Navigate the loggedout user back to login page */
onLogoutSucceeded$ = ngrxEffects.createEffect(() => 
  this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Ui.Buttons.LogOut.actions.succeeded),
    rxjs.map(() => {
     
      this._router.navigate(['/login'])
    })
  ), { dispatch: false }
)

  /**
   * Login process is started, we need to call the API to login and obtain the
   * JWT token and do the standard (success, fail) actions.
   */
  onRemoteApiStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Api.actions.started),
    rxjs.switchMap((action) =>
      this._authApiService.login(action.username, action.password).pipe(
        rxjs.tap((res) => console.log(`res`, res)),
        rxjs.map(response => actions.Auth.Api.actions.succeeded({ jwtToken: response.jwtToken })),
        rxjs.catchError(error =>
          {
            const errorMessage = error?.error?.message || 'Login request failed' 
            return rxjs.of(actions.Auth.Api.actions.failed({ errorMessage }))
          }
        )
      ))
  ))
  
  onLoginSucceeded$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Api.actions.succeeded),
    rxjs.map(() => {
      // redirect to content page upon successful login
      this._router.navigate(['/conversations']) 
    })
  ), { dispatch: false })

  /** @inheritdoc */
  ngrxOnInitEffects(): Action {
    return actions.Auth.Misc.actions.initialized()
  }
}