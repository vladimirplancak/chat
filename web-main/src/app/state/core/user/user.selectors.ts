import * as ngrxStore from '@ngrx/store'
import { UserState } from './user.reducer'
import * as models from '../../../models'
import * as auth from '../auth/auth.selectors'

interface UserFilterParams {
  /**
   * User id or ids to filter users by
   */
  userIdOrIds?: models.User.Id | readonly models.User.Id[]
  /**
   * Ignore users ids from the result
   */
  ignoreUserIdOrIds?: models.User.Id | readonly models.User.Id[]
  /**
   * Search term to filter users by
   * 
   * {@link models.User} object will be filtered by {@link JSON.stringify} methods
   */
  searchTerm?: string
}

const STATE = ngrxStore.createFeatureSelector<UserState>(UserState.FEATURE_KEY)

export namespace User {
  export const USER_LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.userLookup
  )

  export const SELF_DETAILS = ngrxStore.createSelector(
    auth.Auth.SELF_ID,
    USER_LOOKUP,
    (selfId,userLookup ) =>{
      if(selfId == undefined){
        throw new Error('Self is undefined')
      }
      return userLookup[selfId]
    }
  )
  /**
   * TODO: filter works only with ids, so we should convey that with the name of the selector.
   */
  export const USER_LOOKUP_FILTERED = (params: UserFilterParams = { userIdOrIds: undefined }) => ngrxStore.createSelector(
    USER_LOOKUP,
    (userLookup) => {

      let userIds = _isReadonlyArray(params.userIdOrIds) ? params.userIdOrIds : [params.userIdOrIds]

      // if we are not filtering by userIds, we are still filtering by search
      // term, thus we need to "get" all the users
      if (!params.userIdOrIds) {
        userIds = Object.keys(userLookup)
      }

      if(params.ignoreUserIdOrIds) {
        throw new Error('Not implemented')
      }

      return Object.fromEntries(
        Object.entries(userLookup)
          .filter(([id, user]) => {
            // TODO Below can be better written
            if (params.searchTerm) {
              const userString = JSON.stringify(user)
              const fountBySearchTerm = userString.toLowerCase().includes(params.searchTerm.toLowerCase().trim())
              return userIds.includes(id) && fountBySearchTerm
            } else {
              return userIds.includes(id)
            }
          })
      )
    }
  )

  export const USERS = ngrxStore.createSelector(
    USER_LOOKUP,
    lookup => 
        Object.entries(lookup)
          .map(([, user]) => (user ? user : undefined))
          .filter((userOrUndefined): userOrUndefined is models.User => userOrUndefined !== undefined)
  )

  export const USERS_FILTERED = (...args: Parameters<typeof USER_LOOKUP_FILTERED>) => ngrxStore.createSelector(
    USER_LOOKUP_FILTERED(...args),
    (filteredLookup) =>  Object.entries(filteredLookup)
      .map(([id, user]) => (user ? user : undefined))
      .filter((userOrUndefined): userOrUndefined is models.User => userOrUndefined !== undefined)
  )

  export const PRESENT_LOADER = ngrxStore.createSelector(
    STATE,
    state => state.pendingListRequest
  )

  export const LIST_ERROR = ngrxStore.createSelector(
    STATE,
    // TODO: Implement
    state => false
  )

  /**
   * By providing a user id, this selector will return a boolean value,
   * indicating if the user is currently online.
   */
  export const IS_ONLINE = (userId: models.User.Id) => ngrxStore.createSelector(
    STATE,
    state => state.onlineUserIds.has(userId)
  )
  
}


// NOTE: If this is needed on some other place, this should be moved into some
// common place.
function _isArray<T>(value: T | readonly T[] | T[]): value is T[] {
  return Array.isArray(value)
}
// NOTE: If this is needed on some other place, this should be moved into some
// common place.
function _isReadonlyArray<T>(value: T | readonly T[] | T[]): value is readonly T[] {
  return Array.isArray(value)
}


