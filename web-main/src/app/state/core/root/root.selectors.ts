import * as ngrxStore from '@ngrx/store'
import { RootState } from './root.reducer'

const STATE = ngrxStore.createFeatureSelector<RootState>(RootState.FEATURE_KEY)

export namespace Root {
  export namespace Ui {
    export const INITIALIZED = ngrxStore.createSelector(STATE, (state) => state.initialized)
  }
}

