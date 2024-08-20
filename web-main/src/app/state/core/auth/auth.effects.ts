import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as actions from './auth.actions'
import * as rxjs from 'rxjs'
import * as services from '../../services';


/**
 * - When the application loads we want to check few stuff: 
 *  1. if we are logged in (if our AuthApiService vouches for us that token is valid, we will save it in the state)
 */

@ngCore.Injectable()
export class AuthEffects implements ngrxEffects.OnInitEffects{
  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _authApiService = ngCore.inject(services.AuthApiService)

  initialized$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Auth.Misc.actions.initialized),
      rxjs.map(() => actions.Auth.Misc.actions.localAuthStarted())
    )
  )

  localAuthStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Misc.actions.localAuthStarted),
    rxjs.switchMap(() => this._authApiService.validateJwt()),
    rxjs.map((possibleJwtToken) => 
      // NOTE: If we have JWT token, after we "validate it", consider that
      // localAuthSucceeded, otherwise consider it failed.
      possibleJwtToken 
        ? actions.Auth.Misc.actions.localAuthSucceeded({jwtToken: possibleJwtToken}) 
        : actions.Auth.Misc.actions.localAuthFailed()
    )
  ))


  onFormSubmitted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Ui.LoginForm.actions.submitted),
    rxjs.map((action) => actions.Auth.Api.actions.started(action))
   
  ))

  onApiStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Api.actions.started),
    rxjs.switchMap((action) => this._authApiService.login(action.username, action.password).pipe(
      rxjs.map(jwtToken => actions.Auth.Api.actions.succeeded({jwtToken})),
      rxjs.catchError(error =>
        rxjs.of(actions.Auth.Api.actions.failed({errorMessage: error?.message}))
      ) 
    ))
  ))


  /** @inheritdoc */
  ngrxOnInitEffects(): Action {
    return actions.Auth.Misc.actions.initialized()
  }
}