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
      state => undefined ?? 'something went wrong'
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
      state => undefined ?? 'something went wrong'
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