import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import { Action } from '@ngrx/store';
import * as actions from './auth.actions'
import * as rxjs from 'rxjs'

// TODO: probably wont be even used, to reevaluate if this is needed?
@ngCore.Injectable()
export class AuthEffects implements ngrxEffects.OnInitEffects{
  private readonly _actions = ngCore.inject(ngrxEffects.Actions)


  localAuthStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Auth.Misc.actions.localAuthStarted),
    rxjs.map(() => {
      // TODO: check if token exist in local storage, if does, return it, if does not return authFailed
      return actions.Auth.Misc.actions.localAuthSucceeded({jwtToken: 'TODO: TO BE JWT TOKEN'})
    })
  ))


  // TODO: when actions.Auth.Ui.LoginForm.actions.submitted 
  //  - dispatch actions.Auth.Api.actions.started
  //  - when actions.Auth.Api.actions.started
  //  - dispatch actions.Auth.Api.actions.succeeded / actions.Auth.Api.actions.failed


  initialized$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Auth.Misc.actions.initialized),
      rxjs.map(() => actions.Auth.Misc.actions.localAuthStarted())
    )
  )

  // TODO: implement effects

  /** @inheritdoc */
  ngrxOnInitEffects(): Action {
    return actions.Auth.Misc.actions.initialized()
  }
}