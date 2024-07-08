import * as ngrxStore from '@ngrx/store'
import { UserState } from './user.reducer' 


const STATE = ngrxStore.createFeatureSelector<UserState>(UserState.FEATURE_KEY)

export namespace User {
  
}