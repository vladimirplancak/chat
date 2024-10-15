import * as ngCore from '@angular/core';
import * as components from './components'
import * as state from '../../../../../../../state'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../../../../../models'
import * as common from '../../../../../../common'

@ngCore.Component({
  imports: [
    components.participantItem.Component,
    components.participantSelectorDialog.Component,
    common.overlay.centered.Component,
  ],
  standalone: true,
  styleUrl: './participant-list.component.scss',
  templateUrl: './participant-list.component.html',
  selector: 'app-participant-list'
})
export class ParticipantListComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selectedConSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)
  private readonly _userLookUpSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP)
  public readonly presentListErrorSg = this._store.selectSignal(state.core.user.selectors.User.LIST_ERROR)
  public readonly presetParticipantSelectorDialogSg = this._store.selectSignal(state.core.con.selectors.Conversation.ParticipantsDialog.SHOULD_PRESENT)
  /**
   * Users are loading if there is no selected conversation (and) or if there is
   * ongoing request to fetch the list of users.
   */
  public readonly presentLoaderSg = ngCore.computed(() => {
    const selectedCon = this._selectedConSg()
    if (!selectedCon) {
      return true
    }
    const presentLoader = this._store.selectSignal(state.core.user.selectors.User.PRESENT_LOADER)()
    return presentLoader
  })

  /** All participants of the selected conversation. */
  public readonly participantsSg = ngCore.computed(() => {
    const selectedCon = this._selectedConSg()
    if (!selectedCon) {
      return []
    }
    return this._store.selectSignal(state.core.user.selectors.User.USERS_FILTERED(selectedCon.participantIds))()
  })

  /**
   * Lookup of online status of participants.
   * 
   * @example
   * ```ts 
   * {
   *  '0'       : true,
   *  '1'       : false,
   *  'user-id' : true,
   * }
   * ```
   */
  public participantOnlineLookupSg = ngCore.computed(() => {
    const participants = this.participantsSg()
    return participants.reduce<Partial<Record<models.User.Id, boolean>>>((lookup, participant) => {
      const isOnline = this._store.selectSignal(state.core.user.selectors.User.IS_ONLINE(participant.id))()
      lookup[participant.id] = isOnline
      return lookup
    }, {})
  })



  public participantListAddBtnClickHandler() {
    this._store.dispatch(state.core.con.actions.Con.Ui.List.Buttons.Add.actions.clicked())
  }

  public participantDialogBackdropClickHandler() {
    this._store.dispatch(state.core.con.actions.Con.Ui.ParticipantSelectorDialog.Backdrop.actions.clicked())
  }
}