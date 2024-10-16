
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
export class ParticipantSelectorDialogComponent {


  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  private readonly _selectedConversation = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)


  /**
   * All users except the current user.
   */
  public readonly usersSg = ngCore.computed((
    allUSers = this._store.selectSignal(state.core.user.selectors.User.USERS)(),
    _selfId = this._selfIdSg()
  ) => allUSers.filter((user) => user.id !== _selfId))

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
  
   // console.log(`saveBtnClickHandler()`, newSelectedUserIds);
  
    
    if (!newSelectedUserIds || newSelectedUserIds.length === 0) {
      
      throw new Error('There are no participant ids selected.') 
    }
  
   
    this._store.dispatch(
      con.Con.Ui.ParticipantSelectorDialog.Buttons.Save.actions.clicked({
        selectedParticipantIds: newSelectedUserIds,
      })
    );
  }
  

  public participantCheckboxChangeHandler(userId: models.User.Id): void {
    this._store.dispatch(con.Con.Ui.ParticipantSelectorDialog.Item.actions.clicked({ userId }));
  }
}
