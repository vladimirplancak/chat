import * as ngrxStore from '@ngrx/store'
import { ConState } from './conversation.reducer'
import * as models from '../../../models'
import * as ngrxRouterStore from '@ngrx/router-store'
import * as auth from '../auth/auth.selectors';

const {
  selectRouteParam, // factory function to select a route param
} = ngrxRouterStore.getRouterSelectors();

const STATE = ngrxStore.createFeatureSelector<ConState>(ConState.FEATURE_KEY)

export namespace Conversation {
  export const CONS = ngrxStore.createSelector(
    STATE,
    state =>
      Object.entries(state.conLookup)
        .map(([id, con]) => (con ? con : undefined))
        .filter((conOrUndefined): conOrUndefined is models.Conversation.WithMessages => conOrUndefined !== undefined)
  )

  export const LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.conLookup
  )

  export const PRESENT_LOADER = ngrxStore.createSelector(
    STATE,
    state => state.pendingConListRequest
  )

  /**
   * Selector that returns the conversations where participant is present
   */
  export const BY_PARTICIPANT = (participantId: models.User.Id) => ngrxStore.createSelector(CONS, cons => {
    return cons.filter(con => con.participantIds?.includes(participantId))
  })

  /**
   * Selector that returns the conversations where participant is present and
   * the conversation is a direct conversation to "self".
   */
  export const DIRECT = (participantId: models.User.Id) => ngrxStore.createSelector(
    BY_PARTICIPANT(participantId),
    // TODO: Explore what will happen if more conversation are found here, because it might happen?
    cons => cons.find(con => con.participantIds?.length === 2)
  )


  export namespace Selected {
    export const ID = ngrxStore.createSelector(
      selectRouteParam('conversationId'),
      conversationId => conversationId
    )

    export const ENTRY = ngrxStore.createSelector(
      LOOKUP,
      ID,
      (lookup, selectedId) => selectedId ? lookup[selectedId] : undefined
    )
    
    export const IS_SELF_CON_CREATOR = ngrxStore.createSelector(
      ID,
      LOOKUP,
      auth.Auth.SELF_ID,
      (conId, lookup, selfId) => { 
        // console.log(`selector/ConId`, conId)
        // console.log(`selector/lookup`, lookup)
        // console.log(`selector/selfId`, selfId)
        const selectedConversation = conId ? lookup[conId] : undefined
        // console.log(`selector/selectedConversation`, selectedConversation)
        if(!selectedConversation || !selfId){
          return false
        }
        return selectedConversation.creatorId === selfId
      }
    )
  }
  export namespace HoveredParticipant{
    export const ID = ngrxStore.createSelector(
      STATE,
      (state) => state.hoveredParticipantId
    )
  }
  export namespace ParticipantsDialog {
    const DATA  = ngrxStore.createSelector(
      STATE,
      state => state.participantSelectorDialog
    )

    export const SHOULD_PRESENT = ngrxStore.createSelector(
      DATA,
      data => data.open
    )

    export const NEW_SELECTED_IDS = ngrxStore.createSelector(
      DATA,
      data => data.newSelectedIds
    )

    export const SEARCH_TERM = ngrxStore.createSelector(
      DATA,
      data => data.searchTerm
    )
  }
}

export namespace Message {
  export namespace InCon {
    /** 
     * Present a loader for passed conversation id if there is an ongoing
     * request to fetch messages for that conversation.
     */
    export const PRESENT_LOADER = (conId: models.Conversation.Id) => ngrxStore.createSelector(
      STATE,
      state => state.pendingConListMessagesRequests.has(conId)
    )

    export const ERROR = (conId: models.Conversation.Id) => ngrxStore.createSelector(
      STATE,
      state => undefined 
    )
  }

  export namespace InSelectedCon {
    /**
     * There's a an edge case, saying, if the selected conversation ID doesn't
     * exist we will show loader
     */
    export const PRESENT_LOADER = ngrxStore.createSelector(
      STATE,
      Conversation.Selected.ID,
      (state, selectedConId) => selectedConId ? state.pendingConListMessagesRequests.has(selectedConId) : false
    )

    export const ERROR = ngrxStore.createSelector(
      STATE,
      Conversation.Selected.ID,
      state => undefined 
    )

    /**
     * Basically, this selector is used to retrieve the in-progress message For
     * the selected conversation, for more information, take a look at
     * {@link Conversation.Selected.ID}
     */
    export const IN_PROGRESS = ngrxStore.createSelector(
      STATE,
      Conversation.Selected.ID,
      (
        state,
        selectedConId
      ) => selectedConId
          ? state.inProgressMessageByConId?.[selectedConId]
          : undefined
    )
  }
}