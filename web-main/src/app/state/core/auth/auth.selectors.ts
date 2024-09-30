import * as ngrxStore from '@ngrx/store'
import { AuthState } from './auth.reducer'
import * as models from '../../../models'



const STATE = ngrxStore.createFeatureSelector<AuthState>(AuthState.FEATURE_KEY)

export namespace Auth {
  export const SELF = ngrxStore.createSelector(STATE, (state) =>
    {
      return state.jwtToken ? models.Auth.Self.from(state.jwtToken) : undefined
    }
  )

  export const SELF_ID = ngrxStore.createSelector(SELF, (self) => self?.userId)
}

