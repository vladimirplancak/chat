import { createReducer, on, } from '@ngrx/store'

export interface UserState {

}
export namespace UserState {
  export const FEATURE_KEY = 'User'
  const INITIAL: UserState = {}

  export const REDUCER = createReducer<UserState>(INITIAL)
}