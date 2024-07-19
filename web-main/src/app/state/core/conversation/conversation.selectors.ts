import * as ngrxStore from '@ngrx/store'
import { ChannelState } from './conversation.reducer'
import * as models from '../../../models'


const STATE = ngrxStore.createFeatureSelector<ChannelState>(ChannelState.FEATURE_KEY)

export namespace Channel {
  export const CHANNELS = ngrxStore.createSelector(
    STATE,
    state => 
        Object.entries(state.convoLookup)
          .map(([id, convo]) => (convo ? convo : undefined))
          .filter((convoOrUndefined): convoOrUndefined is models.Conversation => convoOrUndefined !== undefined)
  )

  export const CONVO_LOOKUP = ngrxStore.createSelector(
    STATE,
    state => state.convoLookup
  )

  export const PRESENT_LOADER = ngrxStore.createSelector(
    STATE,
    // TODO: finish implementation
    state => false
  )
}

