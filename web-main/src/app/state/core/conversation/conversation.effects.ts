import * as ngCore from '@angular/core';
import * as ngrxEffects from '@ngrx/effects';
import * as rxjs from 'rxjs';
import * as ngrxStore from '@ngrx/store';
import * as actions from './conversation.actions'
import * as selectors from './conversation.selectors'
import * as authState from '../auth'
import * as services from '../../services';
import * as rootState from '../root'
import * as ngRouter from '@angular/router'
import * as auth from '../auth'

@ngCore.Injectable()
export class ConversationEffects {

  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _conApiService = ngCore.inject(services.ConApiService)
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _router = ngCore.inject(ngRouter.Router)


  onRootInitialized$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(rootState.actions.Root.Ui.actions.initialized),
    rxjs.switchMap(() =>
      rxjs.of(actions.Con.Api.Con.List.actions.started()),
    ),
  ))


  onApiConListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.List.actions.started),
    rxjs.switchMap(() => this._conApiService.getAllConvos().pipe(
      rxjs.map(conversations => actions.Con.Api.Con.List.actions.succeeded({ conversations })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.List.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onSelectedConversationChanged$ = ngrxEffects.createEffect(() => this._store.select(selectors.Conversation.Selected.ID).pipe(
    rxjs.filter(selectedConId => !!selectedConId),
    rxjs.switchMap(selectedConId => {
      if(!selectedConId){
        throw new Error('No conversation selected.')
      }
      return this._conApiService.getParticipantsByConId(selectedConId).pipe(
        rxjs.map(consParticipants =>
          actions.Con.Api.Con.LoadConParticipantsByConId.actions.succeeded({ id:  consParticipants.id, participantIds: consParticipants.participantIds })
        ),
        rxjs.catchError(error =>
          rxjs.of(actions.Con.Api.Con.LoadConParticipantsByConId.actions.failed({ errorMessage: error?.message }))
        )
      )
    })
  ));
  
  onApiMessageListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Message.List.actions.started),
    rxjs.filter(conversationId => !!conversationId),
    rxjs.switchMap(({ conversationId }) => this._conApiService.getConMessages(conversationId).pipe(
      rxjs.map(messages =>
        actions.Con.Api.Message.List.actions.succeeded({
          messages,
          conversationId
        })
      ),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Message.List.actions.failed({ conversationId, errorMessage: error?.message }))
      )
    )),
  ))
  // TODO: explain what this does.
  shouldLoadMessages$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.List.actions.started),
    rxjs.switchMap((action) => {
      return this._store.select(selectors.Conversation.Selected.ID)
        .pipe(
          rxjs.filter((selectedId: any): selectedId is string => !!selectedId),
          rxjs.first(),
          rxjs.map(conversationId => actions.Con.Api.Message.List.actions.started({ conversationId }))
        )
      }),
  ))

  onApiConGetStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Get.actions.started),
    rxjs.switchMap(({ conversationId }) => this._conApiService.getCon(conversationId).pipe(
      rxjs.map(conversation => actions.Con.Api.Con.Get.actions.succeeded({ conversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Get.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))


  createConversationOrSelectExisting$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Ui.UserSelectorDialog.actions.selected),
    rxjs.switchMap((action) => {
      return rxjs.of(action).pipe(
        rxjs.withLatestFrom(
          this._store.select(authState.selectors.Auth.SELF_ID),
          this._store.select(selectors.Conversation.DIRECT(action.userId)),
        ),
        rxjs.switchMap(([, selfId, directCon]) => {
          if (!selfId) {
            throw new Error('User not authenticated');
          }

          if (directCon) {   
            return rxjs.of(actions.Con.Misc.Selection.actions.requested({ directConId: directCon.id }));
          } else {
            return rxjs.of(actions.Con.Api.Con.Create.actions.started({ input: { participantIds: [selfId, action.userId] } }));
          }
        })
      );
    })
  ));


  onApiConCreateSucceeded$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Create.actions.succeeded),
    rxjs.map(({ conversation: { id } }) => {
      return actions.Con.Misc.Selection.actions.requested({ directConId: id })
    })
  ))

  navigateToSelectedConversation$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Misc.Selection.actions.requested),
    rxjs.map(({ directConId }) => {
      this._router.navigate(['conversations', directConId]);
    })
  ), { dispatch: false });


  onApiConCreateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Create.actions.started),
    rxjs.switchMap(({ input }) => this._conApiService.createConv(input.participantIds).pipe(
      rxjs.map(createdConversation => actions.Con.Api.Con.Create.actions.succeeded({ conversation: createdConversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Create.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConUpdateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Update.actions.started),
    rxjs.switchMap(({ id, updates }) => this._conApiService.updateConv(id, updates).pipe(
      rxjs.map(updatedConversation => actions.Con.Api.Con.Update.actions.succeeded({ conversation: updatedConversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Update.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConDeleteStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Delete.actions.started),
    rxjs.switchMap(({ id }) => this._conApiService.deleteCon(id).pipe(
      rxjs.map((deletedConversation) => actions.Con.Api.Con.Delete.actions.succeeded({ conversation: deletedConversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Delete.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onConversationSelected$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(
      actions.Con.Ui.List.ConItem.actions.clicked,
      actions.Con.Api.Con.Create.actions.succeeded,
    ),

    rxjs.switchMap((action) =>
      action.type === actions.Con.Ui.List.ConItem.actions.clicked.type
        ? rxjs.of(actions.Con.Api.Message.List.actions.started({ conversationId: action.selectedId }))
        : rxjs.of(actions.Con.Api.Message.List.actions.started({ conversationId: action.conversation.id })),
    ),
  ))
  


  /**
   * Purpose of the effect, is to compute the payload for the {@link actions.Con.Api.Message.Send.actions.started}
   * action, and dispatch it.
   */
  uiOnMessageSend$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Ui.MessageSender.Buttons.Send.actions.clicked),
    rxjs.withLatestFrom(
      this._store.select(selectors.Conversation.Selected.ID),
      this._store.select(authState.selectors.Auth.SELF_ID),
      this._store.select(selectors.Message.InSelectedCon.IN_PROGRESS)
    ),
    rxjs.map(([action, conId, userId, inProgressContent]) => {
      if (!conId) {
        throw new Error('No conversation')
      }
      if (!userId) {
        throw new Error('No user')
      }
      if (!inProgressContent) {
        throw new Error('No content')
      }

      return actions.Con.Api.Message.Send.actions.started({
        payloadMessage: {
          conId,
          content: inProgressContent,
          datetime: new Date(),
          userId,
        }
      })
    })
  ));

  onMessageSendStart$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Message.Send.actions.started),

    rxjs.switchMap((action) => {
      return this._conApiService.sendConMessage(action.payloadMessage).pipe(
        rxjs.map(() => {
          debugger
          return actions.Con.Api.Message.Send.actions.succeeded({ conversationId: action.payloadMessage.conId });
        }),
        rxjs.catchError(error => {
          return rxjs.of(actions.Con.Api.Message.Send.actions.failed({ errorMessage: error?.message }))
        })
      )
    })
  ));


  // NOTE: Purpose of this effect is: 
  // back-end sends you new message, you receive it, through 'this_conApiSErvice.msgReceived$' stream, and then you dispatch an action,
  // that will update the state.
  onMessageReceived$ = ngrxEffects.createEffect(() =>
    this._conApiService.msgReceived$.pipe(
      rxjs.map((message) =>
        actions.Con.Api.Message.Subscriptions.actions.messageReceived({ message })
      ),
    )
  )

  onParticipantsSelected$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Con.Ui.ParticipantSelectorDialog.Buttons.Save.actions.clicked),
      rxjs.withLatestFrom(
        this._store.select(selectors.Conversation.Selected.ID),
      ),
      rxjs.map(([{ selectedParticipantIds }, conversationId]) => {
        if (!conversationId) {
          throw new Error('Cannot proceed without conversation id')
        }

        return actions.Con.Api.Con.Update.actions.started({
          id: conversationId,
          updates: { participantIdsToAdd: selectedParticipantIds },
        })
      })
    )
  );

  onRemovedParticipantClicked$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Con.Ui.List.Buttons.RemoveParticipant.actions.clicked),
      rxjs.withLatestFrom(
        this._store.select(selectors.Conversation.Selected.ID),
        this._store.select(auth.selectors.Auth.SELF_ID)
      ),
      rxjs.map(([{ participantId },conversationId, selfId]) => {
        // NOTE: this should never happen, in case it happens, it means that we
        // have some unforeseen edge case, usually indicating a bug.
        if (!conversationId) {
          throw new Error('Cannot proceed without conversation id')
        }

        // TODO: We are not sure, what should we do at this point If it is ok to
        // remove ourself from the conversation or not? We don't want to
        // speculate at this time, so we will just give a warning.
        if(participantId === selfId) { 
          console.warn('We are about to remove ourself from the conversation')
        }

        return actions.Con.Api.Con.Update.actions.started({
          id: conversationId,
          updates: { participantIdsToRemove: [participantId] },
        })
      })
    )
  )

}