import * as ngrxStore from '@ngrx/store'
import { UserState } from './user.reducer'
import * as models from '../../../models'


const STATE = ngrxStore.createFeatureSelector<UserState>(UserState.FEATURE_KEY)

export namespace User {
  export const USERS = ngrxStore.createSelector(
    STATE,
    state => 
        Object.entries(state.userLookup)
          .map(([id, user]) => (user ? user : undefined))
          .filter((userOrUndefined): userOrUndefined is models.User => userOrUndefined !== undefined)
  )

  export const USERS_LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.userLookup
  )

  export const PRESENT_LOADER = ngrxStore.createSelector(
    STATE,
    // TODO: finish implementation
    state => false
  )
}

