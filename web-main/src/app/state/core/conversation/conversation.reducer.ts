import { createReducer, on, } from '@ngrx/store'
import * as models from '../../../models'
import * as actions from './conversation.actions'
import type * as services from '../../services'

export interface ConState {
    /**
   * Loaded {@link models.Conversation} entities.
   */
  conLookup: Partial<Record<models.Conversation.Id, models.Conversation>>
  /**
   * Loaded {@link models.Conversation.Id} ids.
   * 
   * NOTE: this is a list of ids, and should remain in sync with the
   * {@link conLookup} object.
   */
  ids: models.Conversation.Id[]
  /** 
   * Indicates whether a request has been made to the API to fetch the list of conversations.
   * 
   * @see {@link services.UserApiService.list}
   */
  pendingListRequest: boolean
  /**
   * Indicates which conversations are currently being loaded.
   * 
   * @see {@link services.UserApiService.get}
   */
  pendingGetRequests: Set<models.Conversation.Id>
  /**
   * Indicates whether a mutation is currently ongoing.
   * 
   * @see {@link services.UserApiService.create}
   * @see {@link services.UserApiService.update}
   * @see {@link services.UserApiService.delete}
   */
  pendingMutation: boolean
}
export namespace ConState {
  export const FEATURE_KEY = 'Con'
  /**
   * Represents the initial state of the conversation store.
   */
  const INITIAL: ConState = {
    conLookup: {},
    ids: [],
    pendingListRequest: false,
    pendingGetRequests: new Set(),
    pendingMutation: false,
  }

  export const REDUCER = createReducer<ConState>(
    INITIAL,
    /* -------------------------------------------------------------------------- */
    /*                                API Reducers                                */
    /* -------------------------------------------------------------------------- */
    /* --------------------------------- started -------------------------------- */
    on(actions.Con.Api.List.actions.started, (state) => ({ ...state, pendingListRequest: true })),
    on(actions.Con.Api.Get.actions.started, (state, { conversationId }) => 
        ({ ...state, pendingGetRequests: state.pendingGetRequests.add(conversationId) })),
    on(actions.Con.Api.Create.actions.started, (state) => ({ ...state, pendingMutation: true })),
    on(actions.Con.Api.Update.actions.started, (state) => ({ ...state, pendingMutation: true })),
    on(actions.Con.Api.Delete.actions.started, (state) => ({ ...state, pendingMutation: true })),

    /* -------------------------------- succeeded ------------------------------- */
    on(actions.Con.Api.List.actions.succeeded, (state, {  conversations }) => ({
      ...state,
      pendingListRequest: false,
      ids: conversations.map(conversation => conversation.id),
      conLookup: conversations.reduce((lookup, con) => ({ ...lookup, [con.id]: con }), {})
    })),

    on(actions.Con.Api.Get.actions.succeeded, (state, { conversation }) => {
      // NOTE: if we haven't found a conversation on the back-end 
      // we will consider that we do not need to make an update 
      // to our state.
      if (!conversation) {
        return { ...state }
      }
      const pendingGetRequestsCopy = new Set([...state.pendingGetRequests])
      pendingGetRequestsCopy.delete(conversation.id)
      return ({
        ...state,
        pendingGetRequests: pendingGetRequestsCopy,
        conLookup: { ...state.conLookup, [conversation.id]: conversation }
      })
    }),

    on(actions.Con.Api.Create.actions.succeeded, (state, { conversation }) => ({
      ...state,
      pendingMutation: false,
      ids: [...state.ids, conversation.id],
      conLookup: { ...state.conLookup, [conversation.id]: conversation }
    })),

    on(actions.Con.Api.Update.actions.succeeded, (state, { conversation }) => ({
      ...state,
      pendingMutation: false,
      conLookup: { ...state.conLookup, [conversation.id]: conversation }
    })),

    on(actions.Con.Api.Delete.actions.succeeded, (state, { conversation }) =>  {
      const filteredIds = state.ids.filter(id => id !== conversation.id)
      const conLookupCopy = {...state.conLookup}
      delete conLookupCopy[conversation.id]

      return ({
        ...state,
        ids: filteredIds,
        conLookup: conLookupCopy,
      })
    }),

    /* --------------------------------- failed -------------------------------- */
    // TODO: implement failed reducers
    on(actions.Con.Api.List.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Get.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Update.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Delete.actions.failed, (state, action) => { return { ...state } }),

    /* -------------------------------------------------------------------------- */
    /*                                 UI Reducers                                */
    /* -------------------------------------------------------------------------- */

    /* ------------------------- conversation selection ------------------------- */
    on(actions.Con.Ui.List.ConItem.actions.clicked, (state, {selectedId}) => ({ ...state, selectedId })),
  )
}