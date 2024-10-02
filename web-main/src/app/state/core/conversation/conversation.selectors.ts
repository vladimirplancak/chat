import * as ngrxStore from '@ngrx/store'
import { ConState } from './conversation.reducer'
import * as models from '../../../models'
import * as ngrxRouterStore from '@ngrx/router-store'

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

    export const IN_PROGRESS_MSGS = ngrxStore.createSelector(
      STATE,
      state => state.inProgressMessages
    )

    export const SPECIFIC_IN_PROGRESS_MSG = ngrxStore.createSelector(
      ID,
      IN_PROGRESS_MSGS,
      (selectedConversationId, inProgressMessages) => {
        if (!selectedConversationId) {
          return undefined;
        }
        return inProgressMessages ? inProgressMessages[selectedConversationId] : undefined;
      }
    );
    
    
    
  }



}

export namespace Messages {
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
      state => undefined ?? 'something went wrong'
    )
  }
  
}


