import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import { Conversation } from './conversation.actions'
import * as services from '../../services';
import { Action } from '@ngrx/store';

@ngCore.Injectable()
export class ChannelEffects {

    private readonly _actions = ngCore.inject(ngrxEffects.Actions)
    private readonly _channelApiService = ngCore.inject(services.UserApiService)

    $onRootInitialized = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Ui.Root.actions.initialized),
        rxjs.switchMap(() =>
            rxjs.of(Conversation.Api.List.actions.started()),
        ),
    ))

    $onApiListStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Api.List.actions.started),
        rxjs.switchMap(() => this._channelApiService.list().pipe(
            rxjs.map(conversations => Conversation.Api.List.actions.succeeded({ conversations })),
            rxjs.catchError(error =>
                rxjs.of(Conversation.Api.List.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiGetStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Api.Get.actions.started),
        rxjs.switchMap(({ conversationId }) => this._channelApiService.get(conversationId).pipe(
            rxjs.map(conversation => Conversation.Api.Get.actions.succeeded({ conversation })),
            rxjs.catchError(error =>
                rxjs.of(Conversation.Api.Get.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiCreateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Api.Create.actions.started),
        rxjs.switchMap(({ input }) => this._channelApiService.create(input).pipe(
            rxjs.map(createdConversation => Conversation.Api.Create.actions.succeeded({ conversation: createdConversation })),
            rxjs.catchError(error =>
                rxjs.of(Conversation.Api.Create.actions.failed({ errorMessage: error?.message }))
            )
        )),
    ))

    $onApiUpdateStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Api.Update.actions.started),
        rxjs.switchMap(({ id, updates }) => this._channelApiService.update(id, updates).pipe(
          rxjs.map(updatedConversation => Conversation.Api.Update.actions.succeeded({ conversation: updatedConversation })),
          rxjs.catchError(error =>
            rxjs.of(Conversation.Api.Update.actions.failed({ errorMessage: error?.message }))
          )
        )),
      ))

      $onApiDeleteStarted = ngrxEffects.createEffect(() => this._actions.pipe(
        ngrxEffects.ofType(Conversation.Api.Delete.actions.started),
        rxjs.switchMap(({ id }) => this._channelApiService.delete(id).pipe(
          rxjs.map((deletedConversation) => Conversation.Api.Delete.actions.succeeded({ conversation: deletedConversation })),
          rxjs.catchError(error =>
            rxjs.of(Conversation.Api.Delete.actions.failed({ errorMessage: error?.message }))
          )
        )),
      ))
}