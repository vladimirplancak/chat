import * as ngrxStore from '@ngrx/store'
import { AuthState } from './auth.reducer'
import * as models from '../../../models'
import { UserState } from '../user/user.reducer'
import { User } from '../user/user.selectors'


const STATE = ngrxStore.createFeatureSelector<AuthState>(AuthState.FEATURE_KEY)

export namespace Auth {
  export const SELF = ngrxStore.createSelector(STATE, (state) =>
    state.jwtToken ? state.jwtToken : undefined
  )

  export const SELF_ID = ngrxStore.createSelector(SELF, (self) => self)

  export const CURRENTLY_LOGGED_CLIENT = ngrxStore.createSelector(
    SELF_ID,
    User.USERS_LOOKUP,
    (selfId, userLookup) => {
     
      if (!selfId){ 
        return undefined;
      }else{
        console.log(`userLookup[selfId]`,userLookup[selfId])
        return userLookup[selfId];
      }
      
      
    }
  );
}

