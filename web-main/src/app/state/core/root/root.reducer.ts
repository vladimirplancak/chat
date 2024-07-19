import { createReducer, on, } from '@ngrx/store'
import * as actions from './root.actions'

export interface RootState {
  initialized: boolean
}
export namespace RootState {
  export const FEATURE_KEY = 'User'
  /**
   * Represents the initial state of the root store.
   */
  const INITIAL: RootState = {
    initialized: false
  }

  export const REDUCER = createReducer<RootState>(
    INITIAL,
    on(actions.Root.Ui.actions.initialized, (state) => ({
      ...state,
      initialized: true
    }))
  )
}