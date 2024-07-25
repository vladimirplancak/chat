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
          .filter((conOrUndefined): conOrUndefined is models.Conversation => conOrUndefined !== undefined)
  )

  export const CON_LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.conLookup
  )

  export const SELECTED_CON_ID = ngrxStore.createSelector(
    selectRouteParam('conversationId'),
    conversationId => conversationId
  )

  export const SELECTED_CON = ngrxStore.createSelector(
    CON_LOOKUP,
    SELECTED_CON_ID,
    (lookup, selectedId) => selectedId ? lookup[selectedId] : undefined
  )

  export const PRESENT_LOADER = ngrxStore.createSelector(
    STATE,
    // TODO: finish implementation
    state => false
  )

  export const CONVERSATION_MESSAGES = ngrxStore.createSelector(
    STATE,
    state => {
      return [] as models.Conversation.Message.InConversation[]
    }
  )
}

