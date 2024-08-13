import * as ngrxStore from '@ngrx/store'
import { UserState } from './user.reducer'
import * as models from '../../../models'




const STATE = ngrxStore.createFeatureSelector<UserState>(UserState.FEATURE_KEY)

export namespace User {
  export const USERS_LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.userLookup
  )

  export const USER_LOOKUP_FILTERED = (userIdOrIds: models.User.Id | readonly models.User.Id[]) => ngrxStore.createSelector(
    USERS_LOOKUP,
    (userLookup) => {
      const userIds = _isReadonlyArray(userIdOrIds) ? userIdOrIds : [userIdOrIds]

      return Object.fromEntries(
        Object.entries(userLookup) 
          .filter(([id, user]) => userIds.includes(id))
      )
    }
  )

  export const USERS = ngrxStore.createSelector(
    USERS_LOOKUP,
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


