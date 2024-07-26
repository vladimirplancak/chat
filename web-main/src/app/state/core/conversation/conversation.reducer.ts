import { createReducer, on, } from '@ngrx/store'
import * as models from '../../../models'
import * as actions from './conversation.actions'
import type * as services from '../../services'

export interface ConState {
    /**
   * Loaded {@link models.Conversation} entities.
   */
  conLookup: Partial<Record<models.Conversation.Id, models.Conversation.WithMessages>>
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
   * @see {@link services.ConApiService.conList}
   */
  pendingConListRequest: boolean
  /**
   * Indicates which conversations are currently being loaded.
   * 
   * @see {@link services.UserApiService.getCon}
   */
  pendingGetConRequests: Set<models.Conversation.Id>

  /**
   * Indicates if the conversation message are currently being loaded.
   * 
   * @see {@link services.ConApiService.listConMessages}
   */
  pendingConListMessagesRequests: Set<models.Conversation.Id>
  /**
   * Indicates whether a mutation is currently ongoing.
   * 
   * @see {@link services.ConApiService.createCon}
   * @see {@link services.ConApiService.updateCon}
   * @see {@link services.ConApiService.deleteCon}
   */
  pendingConMutation: boolean
}
export namespace ConState {
  export const FEATURE_KEY = 'Con'
  /**
   * Represents the initial state of the conversation store.
   */
  const INITIAL: ConState = {
    conLookup: {},
    ids: [],
    pendingConListRequest: false,
    pendingGetConRequests: new Set(),
    pendingConMutation: false,
    pendingConListMessagesRequests: new Set(),
  }

  export const REDUCER = createReducer<ConState>(
    INITIAL,
    /* -------------------------------------------------------------------------- */
    /*                              Con API Reducers                              */
    /* -------------------------------------------------------------------------- */
    /* --------------------------------- started -------------------------------- */
    on(actions.Con.Api.Con.List.actions.started, (state) => ({ ...state, pendingConListRequest: true })),
    on(actions.Con.Api.Con.Get.actions.started, (state, { conversationId }) => 
        ({ ...state, pendingGetConRequests: state.pendingGetConRequests.add(conversationId) })),
    on(actions.Con.Api.Con.Create.actions.started, (state) => ({ ...state, pendingConMutation: true })),
    on(actions.Con.Api.Con.Update.actions.started, (state) => ({ ...state, pendingConMutation: true })),
    on(actions.Con.Api.Con.Delete.actions.started, (state) => ({ ...state, pendingConMutation: true })),

    /* -------------------------------- succeeded ------------------------------- */
    on(actions.Con.Api.Con.List.actions.succeeded, (state, {  conversations }) => ({
      ...state,
      pendingConListRequest: false,
      ids: conversations.map(conversation => conversation.id),
      conLookup: conversations.reduce((lookup, con) => ({ ...lookup, [con.id]: con }), {})
    })),

    on(actions.Con.Api.Con.Get.actions.succeeded, (state, { conversation }) => {
      // NOTE: if we haven't found a conversation on the back-end 
      // we will consider that we do not need to make an update 
      // to our state.
      if (!conversation) {
        return { ...state }
      }
      const pendingGetRequestsCopy = new Set([...state.pendingGetConRequests])
      pendingGetRequestsCopy.delete(conversation.id)
      return ({
        ...state,
        pendingGetConRequests: pendingGetRequestsCopy,
        conLookup: { ...state.conLookup, [conversation.id]: {...conversation, messages: []} }
      })
    }),

    on(actions.Con.Api.Con.Create.actions.succeeded, (state, { conversation }) => ({
      ...state,
      pendingConMutation: false,
      ids: [...state.ids, conversation.id],
      conLookup: { ...state.conLookup, [conversation.id]: {...conversation, messages: []} }
    })),

    on(actions.Con.Api.Con.Update.actions.succeeded, (state, { conversation }) => ({
      ...state,
      pendingConMutation: false,
      conLookup: { ...state.conLookup, [conversation.id]: {...conversation, messages: []} }
    })),

    on(actions.Con.Api.Con.Delete.actions.succeeded, (state, { conversation }) =>  {
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
    on(actions.Con.Api.Con.List.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Con.Get.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Con.Update.actions.failed, (state, action) => { return { ...state } }),
    on(actions.Con.Api.Con.Delete.actions.failed, (state, action) => { return { ...state } }),

    /* -------------------------------------------------------------------------- */
    /*                            Message API Reducers                            */
    /* -------------------------------------------------------------------------- */
    /* --------------------------------- started -------------------------------- */
    on(actions.Con.Api.Message.List.actions.started, (state, {conversationId}) => {
      const pendingConListMessagesRequestsCopy = new Set([...state.pendingConListMessagesRequests])
      pendingConListMessagesRequestsCopy.add(conversationId)
      return ({
        ...state,
        pendingConListMessagesRequests: pendingConListMessagesRequestsCopy,
      })
    }),

    /* -------------------------------- succeeded ------------------------------- */
    on(actions.Con.Api.Message.List.actions.succeeded, (state, { conversationId, messages }) => {
      // FIXME: refactor below, we can do some 'early' returns here, and don't
      // need so many explicit checks.
      const pendingConListMessagesRequestsCopy = new Set([...state.pendingConListMessagesRequests])
      pendingConListMessagesRequestsCopy.delete(conversationId)

      
      let conversationCopy = {...state.conLookup}[conversationId]

      if(!conversationCopy) {
        // TODO: do the better error handling, actually do the early return here
        throw new Error('Should never happen')
      }

      conversationCopy = {
        ...conversationCopy,
        messages: messages
      }

      return ({
        ...state,
        pendingConListMessagesRequests: pendingConListMessagesRequestsCopy,
        conLookup: {
          ...state.conLookup,
          [conversationCopy.id]: conversationCopy
        }
      })
    }),
    
    /* -------------------------------------------------------------------------- */
    /*                                 UI Reducers                                */
    /* -------------------------------------------------------------------------- */

    /* ------------------------- conversation selection ------------------------- */
    on(actions.Con.Ui.List.ConItem.actions.clicked, (state, {selectedId}) => ({ ...state, selectedId })),
  )
}