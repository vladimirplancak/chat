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
  /**
   * Stores the messages currently being composed for different conversations.
   * This allows us to keep track of in-progress messages across multiple conversations.
   * 
   * @example 
   * ```ts
   * {
   *  'con-id-1': 'Hello, how are you?',
   *  'con-id-2': 'I am doing well, thank you for asking.'
   * }
   */
  inProgressMessageByConId?: Partial<Record<models.Conversation.Id, string>>

  
  /**
   * Participant dialog state, usually, used in 'ParticipantSelectorDialogComponent'
   */
  participantSelectorDialog: {
    open?: boolean
    newSelectedIds?: models.User.Id[]
  }
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
    participantSelectorDialog: {
      open: false,
      newSelectedIds: []
    }
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


    on(actions.Con.Api.Con.List.actions.succeeded, (state, { conversations }) => ({
      ...state,
      pendingConListRequest: false,
      ids: conversations.map(conversation => conversation.id),
      conLookup: conversations.reduce<Partial<Record<models.Conversation.Id, models.Conversation.WithMessages>>>((lookup, con) => {
        const lookupEntry = state.conLookup[con.id]

        if (!!lookupEntry) {
          return ({
            ...lookup,
            [con.id]: {
              ...lookupEntry,
              ...con,
              messages: lookupEntry.messages
            }
          })
        } else {
          return ({
            ...lookup,
            [con.id]: { ...con, messages: [] }
          })
        }


      }, {})
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
        conLookup: { ...state.conLookup, [conversation.id]: { ...conversation, messages: [] } }
      })
    }),

    on(actions.Con.Api.Con.Create.actions.succeeded, (state, { conversation }) => ({
      ...state,
      pendingConMutation: false,
      ids: [...state.ids, conversation.id],
      conLookup: { ...state.conLookup, [conversation.id]: { ...conversation, messages: [] } }
    })),

    on(actions.Con.Api.Con.Update.actions.succeeded, (state, { conversation }) => {
      console.log(`reducer/state.conLookup`,state.conLookup[conversation.id]?.messages)
    
      const existingMessages = state.conLookup[conversation.id]?.messages
      if(!existingMessages){
        throw new Error ("Messages do not exist")
      }
      return ({...state,
      pendingConMutation: false,
      conLookup: { ...state.conLookup, [conversation.id]: { ...conversation, messages: existingMessages } }})

    }),

    on(actions.Con.Api.Con.Delete.actions.succeeded, (state, { conversation }) => {
      const filteredIds = state.ids.filter(id => id !== conversation.id)
      const conLookupCopy = { ...state.conLookup }
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
    on(actions.Con.Api.Message.List.actions.started, (state, { conversationId }) => {
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


      let conversationCopy = { ...state.conLookup }[conversationId]


      // NOTE: In cases where the conversation is already loaded and there is a
      // conversation record in the state, it is safe to assume that the
      // messages can be stored in the conversation object. However, if the
      // conversation is not loaded, the messages will be stored in the state
      // under a "placeholder" conversation object until the conversation object
      // is fully loaded, which should happen soon.
      if (conversationCopy) {
        conversationCopy = {
          ...conversationCopy,
          messages
        }
      } else {
        const participantIds = messages.map(message => message.userId) // may have duplicates
        const distinctParticipantIdsSet = new Set(participantIds) // make set, so we avoid duplicates
        const distinctParticipantIds = Array.from(distinctParticipantIdsSet) // convert back to array
        state = {
          ...state,
          ids: [...state.ids, conversationId]
        }

        conversationCopy = {
          id: conversationId,
          messages,
          participantIds: distinctParticipantIds,
        }
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
    /* ------------------------------ subscriptions ----------------------------- */
    on(actions.Con.Api.Message.Subscriptions.actions.messageReceived, (state, { message }) => {
      const conversation = state.conLookup[message.conId];
      if (!conversation) {
        return state;
      }

      const updatedCon: models.Conversation.WithMessages = {
        ...conversation,
        messages: [...conversation.messages, message]
      };


      return {
        ...state,
        conLookup: {
          ...state.conLookup,
          [message.conId]: updatedCon
        }
      };

    }),

    /* -------------------------------------------------------------------------- */
    /*                                 UI Reducers                                */
    /* -------------------------------------------------------------------------- */

    /* ------------------------- conversation selection ------------------------- */
    on(actions.Con.Ui.List.ConItem.actions.clicked, (state, { selectedId }) => ({ ...state, selectedId })),

    on(actions.Con.Ui.MessageSender.TextArea.Input.actions.changed, (state, { conversationId, messageText }) => {

      return {
        ...state,
        inProgressMessageByConId: {
          ...state.inProgressMessageByConId,
          [conversationId]: messageText
        }
      };
    }),

    on(actions.Con.Api.Message.Send.actions.succeeded, (state, { conversationId }) => ({
      ...state,
      inProgressMessageByConId: { ...state.inProgressMessageByConId, [conversationId]: undefined }
    })),

    /* ----------------------- participant selector dialog ---------------------- */
    on(actions.Con.Ui.List.Buttons.Add.actions.clicked, (state, { }) => ({
      ...state,
      participantSelectorDialog: {
        open: true,
      }
    })),

    on(actions.Con.Ui.ParticipantSelectorDialog.Backdrop.actions.clicked, (state, { }) => ({
      ...state,
      participantSelectorDialog: {
        open: false,
      }
    })),

    on(actions.Con.Ui.ParticipantSelectorDialog.Item.actions.clicked, (state, { userId }) => {
      let newSelectedIds = state.participantSelectorDialog.newSelectedIds ?? []
      
      if(newSelectedIds.includes(userId)){
        newSelectedIds = newSelectedIds.filter(id => id !== userId)
      } else {
      newSelectedIds = [...newSelectedIds, userId]
      }

      return ({
        ...state,
        participantSelectorDialog: {
          ...state.participantSelectorDialog,
          newSelectedIds 
        }
      })
    }),


  )
}