
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

  
  selectedParticipants = ngCore.signal<string[]>([]);


  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  private readonly _currentConversation = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ID)

  public readonly _participantIds = ngCore.computed((
    currentParticipantIds = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)()
  ) => currentParticipantIds?.participantIds)

  public readonly _participantsObj = ngCore.computed(() => {
    const participantIds = this._participantIds() ?? [];
    return this._store.selectSignal(
      state.core.user.selectors.User.USER_LOOKUP_FILTERED(participantIds)
    );
  });



  public readonly allUsersListSg = ngCore.computed((
    allUSers = this._store.selectSignal(state.core.user.selectors.User.USERS)(),
    _selfId = this._selfIdSg()
  ) => allUSers.filter((user) => user.id !== _selfId))

  public isAlreadyParticipant(userId: string): boolean {
    const participants = this._participantsObj()();
    return participants.hasOwnProperty(userId);
  }

  onParticipantAdded(event: Event, userId: string): void {

    const checkbox = event.target as HTMLInputElement;
    const updatedSelection = [...this.selectedParticipants()];

    if (checkbox.checked) {
      if (!updatedSelection.includes(userId)) {
        updatedSelection.push(userId);
      }
    }
    this.selectedParticipants.set(updatedSelection);
  }

  dispatchSelectedParticipants() {
    const combinedParticipantIds = [
      ...(this._participantIds() ?? []),            
      ...this.selectedParticipants(),     
    ];

    console.log(`Combined participantIds are:`, combinedParticipantIds);

    const selectedConversationId = this._currentConversation()
    if(!selectedConversationId){
      throw new Error('No conversation selected.')
    }
    this._store.dispatch(con.Con.Ui.UpdateParticipantList.actions.started({ conversationId:selectedConversationId, newlySelectedParticipantIds: combinedParticipantIds }));
  }
}
