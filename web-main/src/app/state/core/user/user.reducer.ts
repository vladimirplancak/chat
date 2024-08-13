import { createReducer, on, } from '@ngrx/store'
import * as models from '../../../models'
import * as actions from './user.actions'
import type * as services from '../../services'

export interface UserState {
  /**
   * Loaded {@link models.User} entities.
   */
  userLookup: Partial<Record<models.User.Id, models.User>>
  /**
   * Loaded {@link models.User.Id} ids.
   * 
   * NOTE: this is a list of ids, and should remain in sync with the
   * {@link userLookup} object.
   */
  ids: models.User.Id[]
  /** 
   * Indicates whether a request has been made to the API to fetch the list of users.
   * 
   * Initially this starts with true, because we want to fetch the list of users
   * as soon as possible
   * 
   * @see {@link services.UserApiService.list}
   */
  pendingListRequest: boolean
  /**
   * Indicates which users are currently being loaded.
   * 
   * @see {@link services.UserApiService.get}
   */
  pendingGetRequests: Set<models.User.Id>
  /**
   * Indicates whether a mutation is currently ongoing.
   * 
   * @see {@link services.UserApiService.create}
   * @see {@link services.UserApiService.update}
   * @see {@link services.UserApiService.delete}
   */
  pendingMutation: boolean
  /**
   * List of user ids that are currently online.
   */
  onlineUserIds: Set<models.User.Id>
}
export namespace UserState {
  export const FEATURE_KEY = 'User'
  /**
   * Represents the initial state of the user store.
   */
  const INITIAL: UserState = {
    userLookup: {},
    ids: [],
    pendingListRequest: true,
    pendingGetRequests: new Set(),
    pendingMutation: false,
    onlineUserIds: new Set()
  }

  export const REDUCER = createReducer<UserState>(
    INITIAL,
    /* -------------------------------------------------------------------------- */
    /*                                API Reducers                                */
    /* -------------------------------------------------------------------------- */
    /* --------------------------------- started -------------------------------- */
    on(actions.User.Api.List.actions.started, (state) => ({ ...state, pendingListRequest: true })),
    on(actions.User.Api.Get.actions.started, (state, { userId }) => ({ ...state, pendingGetRequests: state.pendingGetRequests.add(userId) })),
    on(actions.User.Api.Create.actions.started, (state) => ({ ...state, pendingMutation: true })),
    on(actions.User.Api.Update.actions.started, (state) => ({ ...state, pendingMutation: true })),
    on(actions.User.Api.Delete.actions.started, (state) => ({ ...state, pendingMutation: true })),
    // NOTE: it is not important to show a loader, while loading online users,
    // since indictors will show that naturally
    on(actions.User.Api.ListOnlineIds.actions.started, (state) => ({ ...state })),

    /* -------------------------------- succeeded ------------------------------- */
    on(actions.User.Api.List.actions.succeeded, (state, { users }) => ({
      ...state,
      pendingListRequest: false,
      ids: users.map(user => user.id),
      userLookup: users.reduce((lookup, user) => ({ ...lookup, [user.id]: user }), {})
    })),
    on(actions.User.Api.Get.actions.succeeded, (state, { user }) => {
      // NOTE: if we haven't found a user on the back-end 
      // we will consider that we do not need to make an update 
      // to our state.
      if (!user) {
        return { ...state }
      }
      const pendingGetRequestsCopy = new Set([...state.pendingGetRequests])
      pendingGetRequestsCopy.delete(user.id)
      return ({
        ...state,
        pendingGetRequests: pendingGetRequestsCopy,
        userLookup: { ...state.userLookup, [user.id]: user }
      })
    }),
    on(actions.User.Api.Create.actions.succeeded, (state, { user }) => ({
      ...state,
      pendingMutation: false,
      ids: [...state.ids, user.id],
      userLookup: { ...state.userLookup, [user.id]: user }
    })),
    on(actions.User.Api.Update.actions.succeeded, (state, {user}) => ({
      ...state,
      pendingMutation: false,
      userLookup: { ...state.userLookup, [user.id]: user }
    })),
    on(actions.User.Api.Delete.actions.succeeded, (state, {user}) =>  {
      const filteredIds = state.ids.filter(id => id !== user.id)
      const userLookupCopy = {...state.userLookup}
      delete userLookupCopy[user.id]

      return ({
        ...state,
        ids: filteredIds,
        userLookup: userLookupCopy,
      })
    }),
    on(actions.User.Api.ListOnlineIds.actions.succeeded, (state, {onlineUserIds}) =>  {
      return ({
        ...state,
        onlineUserIds: new Set([...onlineUserIds])
      })
    }),

    /* --------------------------------- failed -------------------------------- */
    // TODO: implement failed reducers
    on(actions.User.Api.List.actions.failed, (state, action) => { return { ...state } }),
    on(actions.User.Api.Get.actions.failed, (state, action) => { return { ...state } }),
    on(actions.User.Api.Update.actions.failed, (state, action) => { return { ...state } }),
    on(actions.User.Api.Delete.actions.failed, (state, action) => { return { ...state } }),

    /* -------------------------------------------------------------------------- */
    /*                                Subscriptions                               */
    /* -------------------------------------------------------------------------- */
    on(actions.User.Api.Subscriptions.actions.hasComeOnline, (state, { userId }) => { 
      
      
      return { 
        ...state,
        onlineUserIds: new Set([...state.onlineUserIds, userId])
      } 
    }),
    on(actions.User.Api.Subscriptions.actions.hasWentOffline, (state, {userId}) => { 
      const onlineUserIds = new Set([...state.onlineUserIds])
      onlineUserIds.delete(userId)

      return { 
        ...state,
        onlineUserIds: onlineUserIds
      } 
    }),
  )
}