
import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../../../state'
import * as models from '../../../../../../../../../models'

@ngCore.Component({
  selector: 'app-participant-selector-dialog',
  standalone: true,
  imports: [],
  templateUrl: './participant-selector-dialog.component.html',
  styleUrl: './participant-selector-dialog.component.scss'
})
export class ParticipantSelectorDialogComponent  {

  private readonly _store = ngCore.inject(ngrxStore.Store)

  private readonly _selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  private readonly _selectedConversationSg = 
    this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)

  /** 
   * Current value of the search input, or undefined if not specified.
   * This will implicitly affect the {@link usersSg} selector, filtering users
   * based on the search term.
   */
  public readonly searchTermSg = 
    this._store.selectSignal(state.core.con.selectors.Conversation.ParticipantsDialog.SEARCH_TERM)

  /**
   * All users except self and already existing users.
   */
  public readonly usersSg = ngCore.computed((
    selfId = this._selfIdSg(),
    conParticipantIds = this._selectedConversationSg()?.participantIds ?? [],
    searchTerm = this.searchTermSg()
  ) => {

    /**
     * Users to ignore that are already in the conversation. And since
     * {@link _selfIdSg} represents "us" we should ignore that as well.
     * 
     * NOTE: Due to the typescript typing which gives us flexibility of
     * {@link _selfIdSg} being undefined (which should never happen, and if it
     * does it should be an error), we need to check if it is undefined before
     * concatenating it with {@link conParticipantIds}
     */
    const ignoreUserIds = selfId
      ? conParticipantIds.concat(selfId)
      : conParticipantIds 

    // TODO: Should utilize {ignoreUserIdOrIds} from the selector, once it is implemented
    return this._store.selectSignal(state.core.user.selectors.User.USERS_FILTERED({ 
      searchTerm,
    }))().filter(user => !ignoreUserIds.includes(user.id))
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
  

  private readonly _newSelectedIdsSg = ngCore.computed(
    (newSelectedIds = this._store.selectSignal(state.core.con.selectors.Conversation.ParticipantsDialog.NEW_SELECTED_IDS)() ?? []) => 
      newSelectedIds
  )

  public readonly saveButtonDisabledSg = ngCore.computed((
    newSelectedIds = this._newSelectedIdsSg()
  ) => {
    return  newSelectedIds.length === 0
  })


  public saveBtnClickHandler(): void {
    if (this.saveButtonDisabledSg()) {
      return
    }

    this._store.dispatch(
      state.core.con.actions.Con.Ui.ParticipantSelectorDialog.Buttons.Save.actions.clicked({
        selectedParticipantIds: this._newSelectedIdsSg(),
      })
    )
  }

  public participantCheckboxChangeHandler(userId: models.User.Id): void {
    this._store.dispatch(state.core.con.actions.Con.Ui.ParticipantSelectorDialog.Item.actions.clicked({ userId }));
  }

  public onSearchInputChange(event: Event | undefined): void {    
    const inputElement = event?.target as HTMLInputElement
    const searchTerm = inputElement.value
    this._store.dispatch(state.core.con.actions.Con.Ui.ParticipantSelectorDialog.Search.actions.changed({ searchTerm }))
  }
}
