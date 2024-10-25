
import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../../../state'
import * as models from '../../../../../../../../../models'
import * as con from '../../../../../../../../../state/core/conversation/conversation.actions'

@ngCore.Component({
  selector: 'app-participant-selector-dialog',
  standalone: true,
  imports: [],
  templateUrl: './participant-selector-dialog.component.html',
  styleUrl: './participant-selector-dialog.component.scss'
})
export class ParticipantSelectorDialogComponent implements ngCore.OnInit {
  ngOnInit(): void {
    console.log(this._searcedTerm())
  }



  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  private readonly _selectedConversation = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)
  public readonly _searcedTerm = this._store.selectSignal(state.core.con.selectors.Conversation.ParticipantsDialog.SEARCHED_TERM)

  /**
   * Userlist (without the current user and already existing users, filtered by searchTerm
   */

  public readonly searchTermUsersSg = ngCore.computed((
    allUSers = this.usersSg(),
    existingUsers = this._selectedConversation()?.participantIds ?? [],
    searchTerm = this._searcedTerm()?.trim().toLocaleLowerCase() || '',
  ) => {
    const nonParticipantUsers = allUSers.filter(user => !existingUsers.includes(user.id))
    const filterdUsersBySearchTerm = nonParticipantUsers.filter(user =>
      user.name.toLocaleLowerCase().includes(searchTerm)
    )
    return filterdUsersBySearchTerm

  })
  /**
   * All users except the current user.
   */
  public readonly usersSg = ngCore.computed((
    allUsers = this._store.selectSignal(state.core.user.selectors.User.USERS)(),
    _selfId = this._selfIdSg()
  ) => allUsers.filter((user) => user.id !== _selfId))

  /**
   * All participants of the current conversation.
   * 
   * @example 
   * ['user-id-1', 'user-id-3']
   * // ->
   * {
   *  'user-id-1': true,
   *  'user-id-3': true,
   * }
   */
  public readonly disabledUserIdsLookupSg = ngCore.computed((
    selectedConversation = this._selectedConversation()
  ) => {
    if (selectedConversation) {
      return selectedConversation.participantIds.reduce<Record<models.User.Id, boolean>>((lookup, userId) => {
        lookup[userId] = true

        return lookup
      }, {})
    } else {
      return {}
    }
  })

  /**
   * New selected user ids lookup
   * 
   * @example
   * ['user-id-1', 'user-id-3']
   * // ->
   * {
   * 'user-id-1': true,
   * 'user-id-3': true,
   * }
   */
  public readonly checkedUserIdsLookupSg = ngCore.computed((
    newSelectedUserIds = this._store.selectSignal(state.core.con.selectors.Conversation.ParticipantsDialog.NEW_SELECTED_IDS)()
  ) => {
    if (!newSelectedUserIds) {
      return {}
    } else {
      return newSelectedUserIds.reduce<Record<models.User.Id, boolean>>((lookup, userId) => {
        lookup[userId] = true

        return lookup
      }, {})
    }
  })




  public saveBtnClickHandler(): void {
    const newSelectedUserIds = this._store.selectSignal(
      state.core.con.selectors.Conversation.ParticipantsDialog.NEW_SELECTED_IDS
    )();


    if (!newSelectedUserIds || newSelectedUserIds.length === 0) {
      throw new Error('There are no participant ids selected')
    }


    this._store.dispatch(
      con.Con.Ui.ParticipantSelectorDialog.Buttons.Save.actions.clicked({
        selectedParticipantIds: newSelectedUserIds,
      })
    );
    /**
 * This action efectively resets the state property of participantsSearchTerm to `undefined`
 */
    this._store.dispatch(con.Con.Ui.ParticipantSelectorDialog.Search.actions.changed({ searchTerm: undefined }))
  }

  public participantCheckboxChangeHandler(userId: models.User.Id): void {
    this._store.dispatch(con.Con.Ui.ParticipantSelectorDialog.Item.actions.clicked({ userId }));
  }

  onSearchInputChange(event: Event | undefined): void {
    const inputElement = event?.target as HTMLInputElement
    const searchTerm = inputElement.value
    this._store.dispatch(con.Con.Ui.ParticipantSelectorDialog.Search.actions.changed({ searchTerm }))
    console.log(`search term:`, searchTerm)
  }
}
