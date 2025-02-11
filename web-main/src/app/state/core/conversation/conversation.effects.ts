import * as ngCore from '@angular/core'
import * as ngrxEffects from '@ngrx/effects'
import * as rxjs from 'rxjs'
import * as ngrxStore from '@ngrx/store'
import * as actions from './conversation.actions'
import * as selectors from './conversation.selectors'
import * as authState from '../auth'
import * as services from '../../services'
import * as rootState from '../root'
import * as ngRouter from '@angular/router'
import * as auth from '../auth'

@ngCore.Injectable()
export class ConversationEffects {

  private readonly _actions = ngCore.inject(ngrxEffects.Actions)
  private readonly _conApiService = ngCore.inject(services.ConApiService)
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _router = ngCore.inject(ngRouter.Router)
  private _previousConId$ = new rxjs.ReplaySubject<string | null>(1)


  onRootInitialized$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(rootState.actions.Root.Ui.actions.initialized),
    rxjs.switchMap(() =>
      rxjs.of(actions.Con.Api.Con.List.actions.started()),
    ),
  ))

  onApiConListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.List.actions.started),
    rxjs.withLatestFrom(this._store.select(authState.selectors.Auth.SELF_ID)),
    rxjs.switchMap(([,selfId]) => {
       if(!selfId){
        throw new Error('Self does not exist yet.')
       }
      return this._conApiService.getAllCons(selfId).pipe(
        rxjs.map(conversations => actions.Con.Api.Con.List.actions.succeeded({ conversations })),
        rxjs.catchError(error => rxjs.of(actions.Con.Api.Con.List.actions.failed({ errorMessage: error?.message }))
        )
      )
    }),
  ))

  onSelectedConversationChanged$ = ngrxEffects.createEffect(() => this._store.select(selectors.Conversation.Selected.ID).pipe(
    rxjs.filter(selectedConId => !!selectedConId),
    rxjs.switchMap(selectedConId => {
      if (!selectedConId) {
        throw new Error('No conversation selected.')
      }
      return this._conApiService.getParticipantsByConId(selectedConId).pipe(
        rxjs.map(consParticipants =>
          {
            if(consParticipants.participantIds == undefined){
              throw new Error('No participantIds provided.')
            }
            return actions.Con.Api.Con.LoadConParticipantsByConId.actions.succeeded({ id: consParticipants.id, participantIds: consParticipants.participantIds })
          }
        ),
        rxjs.catchError(error =>
          rxjs.of(actions.Con.Api.Con.LoadConParticipantsByConId.actions.failed({ errorMessage: error?.message }))
        )
      )
    })
  ))

  onApiMessageListStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Message.List.actions.started),
    rxjs.filter(conversationId => !!conversationId),
    rxjs.switchMap(({ conversationId }) => this._conApiService.getConMessages(conversationId).pipe(
      rxjs.map(messages =>
        {
          return actions.Con.Api.Message.List.actions.succeeded({
            messages,
            conversationId
          })
        }
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
    rxjs.switchMap(({ conversationId }) => this._conApiService.getConById(conversationId).pipe(
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
            throw new Error('User not authenticated')
          }

          if (directCon) {
            return rxjs.of(actions.Con.Misc.Selection.actions.requested({ directConId: directCon.id }))
          } else {
            return rxjs.of(actions.Con.Api.Con.Create.actions.started({ input: 
              {
              participantIds: [selfId, action.userId],
              creatorId: selfId 
              },
            
          }))
          }
        })
      )
    })
  ))


  onApiConCreateSucceeded$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Create.actions.succeeded),
    rxjs.map(({ conversation: { id } }) => {
      return actions.Con.Misc.Selection.actions.requested({ directConId: id })
    })
  ))

  navigateToSelectedConversation$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Misc.Selection.actions.requested),
    rxjs.map(({ directConId }) => {
      this._router.navigate(['conversations', directConId])
    })
  ), { dispatch: false })


  onApiConCreateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Create.actions.started),

    rxjs.switchMap(({ input }) => this._conApiService.createCon(input).pipe(
      rxjs.map(createdConversation => actions.Con.Api.Con.Create.actions.succeeded({ conversation: createdConversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Create.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConUpdateStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Update.actions.started),
    rxjs.switchMap(({ id, updates }) => this._conApiService.updateCon(id, updates).pipe(
      rxjs.map(updatedConversation => actions.Con.Api.Con.Update.actions.succeeded({ conversation: updatedConversation })),
      rxjs.catchError(error =>
        rxjs.of(actions.Con.Api.Con.Update.actions.failed({ errorMessage: error?.message }))
      )
    )),
  ))

  onApiConDeleteStarted$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.Delete.actions.started),
    rxjs.switchMap(({ id }) => this._conApiService.deleteCon(id).pipe(
      rxjs.map((res) => {
        this._router.navigate(['conversations'])
        return actions.Con.Api.Con.Delete.actions.succeeded({ conversation: res })
      }),
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
      this._store.select(selectors.Message.InSelectedCon.IN_PROGRESS),
      this._store.select(selectors.Conversation.Selected.IS_NOTSELF_FOCUSING_CURRENT_CON)
    ),
    rxjs.map(([action, currentConId, selfId, inProgressContent, isNotSelfFocusingCurrentCon]) => {
      // console.log(`we are here:`, isNotSelfFocusingCurrentCon)
      if (!currentConId) {
        throw new Error('No conversation')
      }
      if (!selfId) {
        throw new Error('No user')
      }
      if (!inProgressContent) {
        throw new Error('No content')
      }
      return actions.Con.Api.Message.Send.actions.started({
        payloadMessage: {
          conId: currentConId,
          content: inProgressContent,
          dateTime: new Date(),
          userId: selfId,
          isSeen: isNotSelfFocusingCurrentCon ? 1 : 0 
        }
      })
    })
  ))

  onMessageSendStart$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Message.Send.actions.started),
    rxjs.withLatestFrom(this._store.select(selectors.Conversation.Selected.ENTRY)),
    rxjs.switchMap(([action,selectedCon]) => {
      if(!selectedCon?.participantIds?.length ){
        throw new Error('Selected con is neither pub nor priv.')
      }

      const isConPrivate = selectedCon?.participantIds?.length <= 2

      if(isConPrivate){
        return this._conApiService.sendPrivConMessage(action.payloadMessage).pipe(
          rxjs.map(() => {
            return actions.Con.Api.Message.Send.actions.succeeded({ conversationId: action.payloadMessage.conId })
          }),
          rxjs.catchError(error => {
            return rxjs.of(actions.Con.Api.Message.Send.actions.failed({ errorMessage: error?.message }))
          })
        )
      }else{
        // console.log(`1.we dispatch public sendConMesg`)
        return this._conApiService.sendPubConMessage(action.payloadMessage).pipe(
          rxjs.map(()=>{
            return actions.Con.Api.Message.Send.actions.succeeded({ conversationId: action.payloadMessage.conId })
          }),
          rxjs.catchError(error => {
            return rxjs.of(actions.Con.Api.Message.Send.actions.failed({ errorMessage: error?.message }))
          })
        )
        
      }
      
    })
  ))

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
  )

  onRemovedParticipantClicked$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Con.Ui.List.Buttons.RemoveParticipant.actions.clicked),
      rxjs.withLatestFrom(
        this._store.select(selectors.Conversation.Selected.ID),
        this._store.select(auth.selectors.Auth.SELF_ID)
      ),
      rxjs.map(([{ participantId }, conversationId, selfId]) => {
        // NOTE: this should never happen, in case it happens, it means that we
        // have some unforeseen edge case, usually indicating a bug.
        if (!conversationId) {
          throw new Error('Cannot proceed without conversation id')
        }

        // TODO: We are not sure, what should we do at this point If it is ok to
        // remove ourself from the conversation or not? We don't want to
        // speculate at this time, so we will just give a warning.
        if (participantId === selfId) {
          console.warn('We are about to remove ourself from the conversation')
        }

        return actions.Con.Api.Con.Update.actions.started({
          id: conversationId,
          updates: { participantIdsToRemove: [participantId] },
        })
      })
    )
  )
  //------------------------SOCKET EVENTS-----------------------------------//
  onNotSelfSeenPublicMessage$ = ngrxEffects.createEffect(() =>
    this._conApiService.notSelfPubMsgsSeenReceived$.pipe(
      rxjs.map((result)=>{
        const conId = result.conId
        const response = result. response
        // console.log(`result effect:`, result)
       return actions.Con.Socket.Conversation.Event.NotSelfPubConSeenMessagesResponse.actions.seen({conId,response})
      })
    )
  )
  /**
   * This effect listens for conversation updates from the socket and directly updates the state
   */
  onConParticipantListUpdated$ = ngrxEffects.createEffect(() =>
    this._conApiService.conUpdated$.pipe(
      rxjs.map((con) => {
        return actions.Con.Socket.Conversation.Event.UpdateConRequest.actions.updated({ conversation: con })
      }
      ),
    )
  )
  /**
    * This effect listens for the removal of (self) updates from the socket and directly updates the state
    */
  onConParticipantRemoved$ = ngrxEffects.createEffect(() =>
    this._conApiService.conParticipantRemoved$.pipe(
      rxjs.map((conId) => {
        this._router.navigate(['conversations'])
        return actions.Con.Socket.Conversation.Event.UpdateConRequest.actions.removedSelf({ conversationId: conId })
      }
      ),
    )
  )
  // NOTE: Purpose of this effect is: 
  // back-end sends you new message, you receive it, through 'this_conApiSErvice.msgReceived$' stream, and then you dispatch an action,
  // that will update the state.
  onPrivMessageReceived$ = ngrxEffects.createEffect(() =>
    this._conApiService.privMsgReceived$.pipe(
      rxjs.map((message) => {
        return actions.Con.Api.Message.Subscriptions.actions.messageReceived({ message })
      }
      ),
    )
  )
  onPubMessageReceived$ = ngrxEffects.createEffect(() =>
    this._conApiService.pubMsgReceived$.pipe(
      rxjs.map((message) => {
        // console.log('effect/onPubMessageReceived')
        return actions.Con.Api.Message.Subscriptions.actions.messageReceived({ message })
      }
      ),
    )
  )

  onReceivedPubMessageSeen$ = ngrxEffects.createEffect(() =>
    this._actions.pipe(
      ngrxEffects.ofType(actions.Con.Api.Message.Subscriptions.actions.messageReceived),
      rxjs.withLatestFrom(
        this._store.select(auth.selectors.Auth.SELF_ID),
        this._store.select(selectors.Conversation.Selected.ID),
        this._store.select(selectors.Conversation.Selected.PUB_CON_CURRENTLY_CLICKED_PARTICIPANTS_IDS)
      ),
      rxjs.filter(([message, selfId, conId,currentlyClickedParticipantsIds]) => !!conId),
      rxjs.switchMap(([message, selfId, conId, currentlyClickedParticipantsIds]) => {
        if (!conId) {
          console.warn('No conversation selected.')
        return rxjs.EMPTY // No action is dispatched
        }
        
        //  console.log(`currentlyClickedParticipantsIds`, currentlyClickedParticipantsIds)
  
       
        if(currentlyClickedParticipantsIds == undefined){
          return rxjs.EMPTY
        }
         // Filter out selfId and prepare the response
        //  console.log(`currentlyClickedParticipantsIds`, currentlyClickedParticipantsIds)
        const participantIdsClickedStatus = Object.entries(currentlyClickedParticipantsIds)
          .filter(([userId, clickedStatus]) => userId !== selfId && clickedStatus)
          .map(([userId]) => userId) // Extract only the user IDs that are true and not selfId
          // console.log(`conId`, participantIdsClickedStatus)
          // console.log(`participantIdsClickedStatus`, participantIdsClickedStatus)
          const response = {
            [message.message.id]: participantIdsClickedStatus, // Map message ID to participant IDs
          }
          // console.log(`participantIdsClickedStatus`, participantIdsClickedStatus)
        return rxjs.of(
          actions.Con.Socket.Conversation.Event.NotSelfPubConSeenMessagesResponse.actions.seen({
            conId,
            response,
          })
        )
      })
    )
  )
  
  onPrivateConversationDeleted$ = ngrxEffects.createEffect(()=>
  this._conApiService.deletedConversation$.pipe(
    rxjs.map((deletedConversation)=>{
      this._router.navigate(['conversations'])
      return actions.Con.Socket.Conversation.Event.DeleteConRequest.actions.deleted({conversationId:deletedConversation.id})
    })
  )
  )

  onConversationSeeMsgClicked$ = ngrxEffects.createEffect(() => this._actions.pipe(
    ngrxEffects.ofType(actions.Con.Api.Con.LoadConParticipantsByConId.actions.succeeded),
    rxjs.withLatestFrom(
      this._store.select(auth.selectors.Auth.SELF_ID),
      this._previousConId$.asObservable().pipe(rxjs.startWith(null))
    ),
    /** We need to send convId and selfId to the server here
     *  The server will find the conversation and set all of the 
     *  messages not sent by the self, but by other conv participant
     *  to isSeen = true. After that the server will dispatch a notification
     *  to that other participant which will contain the ids of messages[]
     *  whose property isSeen has been changed to true.
     */
    rxjs.switchMap(([clickedConvId, selfId]) => {
      const conType = clickedConvId.participantIds.length <= 2
      const clickedCon = clickedConvId.id
      if (!selfId) {
        throw new Error(`Self does not exist yet.`)
      }
      this._previousConId$.next(clickedCon)
    //  console.log(`effect onConversationSeeMsgClicked$/conType`, conType)
      if(conType){
        return this._conApiService.sendPrivConClickedSeenRequest(clickedCon, selfId).pipe(
          rxjs.map((res) => {
            // console.log(`effect fires`)
            return actions.Con.Socket.Message.Event.SeenPrivateConMessagesStatus.actions.seen({ seenPrivMsgsIdsInCon: res })
          })
        )
      }else{
        return this._conApiService.sendPubConClickedSeenRequest(clickedCon,selfId).pipe(
          rxjs.map((res)=>{
            // console.log(`effect 2 fires`)
            return actions.Con.Socket.Message.Event.SeenPublicConMessagesStatus.actions.seen({ conId: clickedCon, seenPubMsgsIdsInCon: res })
          })
        )
      }

    },
    ),
  ))
// entire effect is mema solution but it works
onPreviousConversationChanged$ = ngrxEffects.createEffect(() => this._previousConId$.pipe(
  rxjs.pairwise(), // Emit [previous, current] whenever the value changes
  rxjs.filter(([prev, curr]) => !!prev && prev !== curr), // Only trigger when previous exists and changed
  rxjs.withLatestFrom(this._store.select(auth.selectors.Auth.SELF_ID)), // Get selfId along with the previous conversation
  rxjs.switchMap(([[previousConId, _], selfId]) => {
    
    // console.log(`Previous conversation changed: ${previousConId}, Self ID: ${selfId}`)
    if(!previousConId){
      throw new Error('doesnt exist')
    }
    if (!selfId) {
      throw new Error(`Self does not exist yet.`)
    }
    return this._conApiService.sendPrivConClickedSeenRequest(previousConId, selfId).pipe(
      rxjs.map((res) => {
        // console.log(`effect fires`)
        return actions.Con.Socket.Message.Event.SeenPrivateConMessagesStatus.actions.seen({ seenPrivMsgsIdsInCon: res })
      })
    )
  })
))

  
onSelfConIdClicked$ = ngrxEffects.createEffect(() => this._actions.pipe(
  ngrxEffects.ofType(actions.Con.Api.Con.LoadConParticipantsByConId.actions.succeeded),
  rxjs.withLatestFrom(this._store.select(auth.selectors.Auth.SELF_ID)),
  rxjs.switchMap(([action, selfId]) => {
    const clickedConId = action.id
    //if true its private con otherwise pub
    const conType = action.participantIds.length <= 2
    if (!clickedConId || !selfId) {
      console.error('No conversation ID or Self ID available.')
      return rxjs.EMPTY  
    }
   
    if(conType){
    //  console.log(`EFFECT/PRIV CON [request]`, clickedConId, selfId)
      return this._conApiService.selfClickedConId(clickedConId, selfId).pipe(
        rxjs.map((res) => {
          const notselfId = res.participantId
          const response = res
      
         return actions.Con.Socket.Conversation.Event.NotSelfPrivConClickedResponse.actions.clicked({notSelfId: notselfId, response:response }) 
        })
      )
    }
    else{
      // console.log(`THIS ONE`)
     
      return this._conApiService.selfClickedPubConId(clickedConId, selfId).pipe(
        rxjs.map((res) =>{
          const conId = res.currentlyClickedPubCon
          const response = res
         return actions.Con.Socket.Conversation.Event.NotSelfPubConClickedResponse.actions.clicked({conId: conId, response:response }) 
        })
      )
    }

  })
))

}