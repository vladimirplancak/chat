import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import { Con } from './conversation.actions'
import * as services from '../../services';
import * as rootState from '../root'

@ngCore.Injectable()
export class ConversationEffects {

    private readonly _actions = ngCore.inject(ngrxEffects.Actions)
    private readonly _conApiService = ngCore.inject(services.ConApiService)

    $onRootInitialized = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(rootState.actions.Root.Ui.actions.initialized),
        rxjs.switchMap(() =>
            rxjs.of(Con.Api.List.actions.started()),
        ),
    ))

    $onApiListStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Con.Api.List.actions.started),
        rxjs.switchMap(() => this._conApiService.list().pipe(
            rxjs.map(conversations => Con.Api.List.actions.succeeded({ conversations })),
            rxjs.catchError(error =>
                rxjs.of(Con.Api.List.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiGetStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Con.Api.Get.actions.started),
        rxjs.switchMap(({ conversationId }) => this._conApiService.get(conversationId).pipe(
            rxjs.map(conversation => Con.Api.Get.actions.succeeded({ conversation })),
            rxjs.catchError(error =>
                rxjs.of(Con.Api.Get.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiCreateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Con.Api.Create.actions.started),
        rxjs.switchMap(({ input }) => this._conApiService.create(input).pipe(
            rxjs.map(createdConversation => Con.Api.Create.actions.succeeded({ conversation: createdConversation })),
            rxjs.catchError(error =>
                rxjs.of(Con.Api.Create.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiUpdateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Con.Api.Update.actions.started),
        rxjs.switchMap(({ id, updates }) => this._conApiService.update(id, updates).pipe(
          rxjs.map(updatedConversation => Con.Api.Update.actions.succeeded({ conversation: updatedConversation })),
          rxjs.catchError(error =>
            rxjs.of(Con.Api.Update.actions.failed({ errorMessage: error?.message }))
          )
        )),
      ))

      $onApiDeleteStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Con.Api.Delete.actions.started),
        rxjs.switchMap(({ id }) => this._conApiService.delete(id).pipe(
          rxjs.map((deletedConversation) => Con.Api.Delete.actions.succeeded({ conversation: deletedConversation })),
          rxjs.catchError(error =>
            rxjs.of(Con.Api.Delete.actions.failed({ errorMessage: error?.message }))
          )
        )),
      ))

      // TODO: implement below
      // $onConversationLoad succcseded => 
      //$onInitliazed => selectedId not in list of my conversations => router to -> no-con-selected
}