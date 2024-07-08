import { createReducer, on, } from '@ngrx/store'
import * as models from '../../../models'

export interface UserState {
  /**
   * Loaded {@link models.User} entities.
   */
  usersLookup: Partial<Record<models.User.Id, models.User>>
  /**
   * Loaded {@link models.User.Id} ids.
   * 
   * NOTE: this is a list of ids, and should remain in sync with the
   * {@link usersLookup} object.
   */
  ids: models.User.Id[]
}
export namespace UserState {
  export const FEATURE_KEY = 'User'
  /**
   * Represents the initial state of the user store.
   */
  const INITIAL: UserState = {
    usersLookup: {},
    ids: [],
  }

  export const REDUCER = createReducer<UserState>(INITIAL)
}