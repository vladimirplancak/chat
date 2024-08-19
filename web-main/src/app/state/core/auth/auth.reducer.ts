import { createReducer, on, } from '@ngrx/store'
import * as actions from './auth.actions'

export interface AuthState {
  jwtToken?: string
  isLoggingIn : boolean
  errorMessage?: string
}
export namespace AuthState {
  export const FEATURE_KEY = 'Auth'
  /**
   * Represents the initial state of the root store.
   */
  const INITIAL: AuthState = {
    jwtToken: '1',
    isLoggingIn: false,
    errorMessage: undefined,
  }

  export const REDUCER = createReducer<AuthState>(
    INITIAL,
    on(actions.Auth.Api.actions.started, state => ({ ...state, isLoggingIn: true })),
    on(actions.Auth.Api.actions.succeeded, (state, { jwtToken }) => ({ ...state, jwtToken, isLoggingIn: false })),
    on(actions.Auth.Api.actions.failed, (state, { errorMessage }) => ({ ...state, errorMessage, isLoggingIn: false, })),

    on(actions.Auth.Misc.actions.localAuthSucceeded, (state, { jwtToken }) => ({ ...state, jwtToken })),
  )
}