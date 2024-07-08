import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import { User } from './user.actions'
import * as services from '../../services';
import { Action } from '@ngrx/store';

@ngCore.Injectable()
export class UserEffects implements ngrxEffects.OnInitEffects {

  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _userApiService = ngCore.inject(services.UserApiService)

  $onApiListStarted = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Api.List.actions.started),
    rxjs.switchMap(() => this._userApiService.list().pipe(
      rxjs.map(users => User.Api.List.actions.succeeded({ users })),
      rxjs.catchError(error =>
        rxjs.of(User.Api.List.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  $onApiGetStarted = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Api.Get.actions.started),
    rxjs.switchMap(({ userId }) => this._userApiService.get(userId).pipe(
      rxjs.map(user => User.Api.Get.actions.succeeded({ user })),
      rxjs.catchError(error =>
        rxjs.of(User.Api.Get.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  /**
   * Hydrates the state
   */
  ngrxOnInitEffects(): Action<string> {
    return User.Api.List.actions.started()
  }
}