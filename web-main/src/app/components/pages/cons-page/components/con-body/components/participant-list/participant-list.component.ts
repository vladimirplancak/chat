import * as ngCore from '@angular/core';
import * as components from './components'
import * as state from '../../../../../../../state'
import * as ngrxStore from '@ngrx/store'

@ngCore.Component({
  imports:[
    components.participantItem.Component
  ],
  standalone: true,
  styleUrl: './participant-list.component.scss',
  templateUrl: './participant-list.component.html',
  selector: 'app-participant-list'
})
export class ParticipantListComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selectedConSg = this._store.selectSignal(state.core.con.selectors.Conversation.SELECTED)

  public readonly participantsSg = ngCore.computed(() => {
    const selectedCon = this._selectedConSg()
    if(!selectedCon) {
      return []
    }

    return this._store.selectSignal(state.core.user.selectors.User.USERS_FILTERED(selectedCon.participantIds))()
  }) 

 
}