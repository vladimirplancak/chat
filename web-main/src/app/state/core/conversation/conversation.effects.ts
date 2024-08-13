import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import * as ngrxStore from '@ngrx/store';
import * as models from '../../../models'
import { Con } from './conversation.actions'
import * as conSelectors from './conversation.selectors'
import * as services from '../../services';
import * as rootState from '../root'

@ngCore.Injectable()
export class ConversationEffects {

  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _conApiService = ngCore.inject(services.ConApiService)
  private readonly _store = ngCore.inject(ngrxStore.Store)

  onRootInitialized$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(rootState.actions.Root.Ui.actions.initialized),
    rxjs.switchMap(() =>
      rxjs.of(Con.Api.Con.List.actions.started()),
    ),
  ))

  onApiConListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.List.actions.started),
    rxjs.switchMap(() => this._conApiService.conList().pipe(
      rxjs.map(conversations => Con.Api.Con.List.actions.succeeded({ conversations })),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Con.List.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  // TODO: explain what this does.
  shouldLoadMessages$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.List.actions.started),
    rxjs.switchMap((action) =>
      this._store.select(conSelectors.Conversation.Selected.ID)
        .pipe(
          rxjs.filter((selectedId: any): selectedId is string => !!selectedId),
          rxjs.first(),
          rxjs.map(conversationId => Con.Api.Message.List.actions.started({ conversationId }))
        )
    ),
  ))

  onApiConGetStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.Get.actions.started),
    rxjs.switchMap(({ conversationId }) => this._conApiService.getCon(conversationId).pipe(
      rxjs.map(conversation => Con.Api.Con.Get.actions.succeeded({ conversation })),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Con.Get.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConCreateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.Create.actions.started),
    rxjs.switchMap(({ input }) => this._conApiService.createCon(input).pipe(
      rxjs.map(createdConversation => Con.Api.Con.Create.actions.succeeded({ conversation: createdConversation })),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Con.Create.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConUpdateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.Update.actions.started),
    rxjs.switchMap(({ id, updates }) => this._conApiService.updateCon(id, updates).pipe(
      rxjs.map(updatedConversation => Con.Api.Con.Update.actions.succeeded({ conversation: updatedConversation })),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Con.Update.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConDeleteStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Con.Delete.actions.started),
    rxjs.switchMap(({ id }) => this._conApiService.deleteCon(id).pipe(
      rxjs.map((deletedConversation) => Con.Api.Con.Delete.actions.succeeded({ conversation: deletedConversation })),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Con.Delete.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onConversationSElected$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Ui.List.ConItem.actions.clicked),
    rxjs.switchMap(({ selectedId }) =>
      rxjs.of(Con.Api.Message.List.actions.started({ conversationId: selectedId })),
    ),
  ))

  onApiMessageListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(Con.Api.Message.List.actions.started),
    rxjs.switchMap(({ conversationId }) => this._conApiService.listConMessages(conversationId).pipe(
      rxjs.map(messages =>
        Con.Api.Message.List.actions.succeeded({
          messages,
          conversationId
        })
      ),
      rxjs.catchError(error =>
        rxjs.of(Con.Api.Message.List.actions.failed({ conversationId, errorMessage: error?.message }))
      )
    )),
  ))
}