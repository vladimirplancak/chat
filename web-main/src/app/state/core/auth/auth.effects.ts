import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as actions from './auth.actions'
import * as rxjs from 'rxjs'
import * as services from '../../services';

// TODO: probably wont be even used, to reevaluate if this is needed?
@ngCore.Injectable()
export class AuthEffects implements ngrxEffects.OnInitEffects{
  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _authApiService = ngCore.inject(services.AuthApiService)

  localAuthStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Misc.actions.localAuthStarted),
    rxjs.map(() => {
      // TODO: check if token exist in local storage, if does, return it, if does not return authFailed
      const jwtToken = localStorage.getItem('jwtToken')
      if(jwtToken) {
        return actions.Auth.Misc.actions.localAuthSucceeded({jwtToken})
      }
      else{
        console.log(`we are here`)
        return actions.Auth.Misc.actions.localAuthFailed()
      }
      
    })
  ))


  // TODO: when actions.Auth.Ui.LoginForm.actions.submitted 
  //  - dispatch actions.Auth.Api.actions.started
  //  - when actions.Auth.Api.actions.started
  //  - dispatch actions.Auth.Api.actions.succeeded / actions.Auth.Api.actions.failed

  onFormSubmitted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Ui.LoginForm.actions.submitted),
    rxjs.map(() =>{
      return actions.Auth.Api.actions.started()
    })
   
  ))

  onApiStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Api.actions.started),
    rxjs.switchMap(() =>{
      console.log('onApiStarted$ effect triggered');
      // TODO: this jwt token should be read from the localstorage
      return this._authApiService.generateJWT().pipe(
        rxjs.map(response => actions.Auth.Api.actions.succeeded({jwtToken: response.jwtToken})),
        rxjs.catchError(error => rxjs.of(actions.Auth.Api.actions.failed({errorMessage: error})))
      )
    })
  ))

  initialized$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Auth.Misc.actions.initialized),
      rxjs.concatMap(() => [
        actions.Auth.Misc.actions.localAuthStarted(),
        actions.Auth.Ui.LoginForm.actions.submitted({ username: 'user', password: 'password123' })
      ])
    )
  )

  // TODO: implement effects

  /** @inheritdoc */
  ngrxOnInitEffects(): Action {
    return actions.Auth.Misc.actions.initialized()
  }
}