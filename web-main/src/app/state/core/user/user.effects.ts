import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import { User } from './user.actions'
import * as services from '../../services';
import { Action } from '@ngrx/store';

@ngCore.Injectable()
export class UserEffects {

  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _userApiService = ngCore.inject(services.UserApiService)

  $onRootInitialized = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Ui.Root.actions.initialized),
    rxjs.switchMap(() => 
      rxjs.of(User.Api.List.actions.started()),
    ),
  ))

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

  $onApiCreateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Api.Create.actions.started),
    rxjs.switchMap(({ input }) => this._userApiService.create(input).pipe(
      rxjs.map(createdUser => User.Api.Create.actions.succeeded({ user: createdUser })),
      rxjs.catchError(error =>
        rxjs.of(User.Api.Create.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  $onApiUpdateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Api.Update.actions.started),
    rxjs.switchMap(({ id, updates }) => this._userApiService.update(id, updates).pipe(
      rxjs.map(updatedUser => User.Api.Update.actions.succeeded({ user: updatedUser })),
      rxjs.catchError(error =>
        rxjs.of(User.Api.Update.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  $onApiDeleteStarted = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(User.Api.Delete.actions.started),
    rxjs.switchMap(({ id }) => this._userApiService.delete(id).pipe(
      rxjs.map((deletedUser) => User.Api.Delete.actions.succeeded({ user: deletedUser })),
      rxjs.catchError(error =>
        rxjs.of(User.Api.Delete.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))
}