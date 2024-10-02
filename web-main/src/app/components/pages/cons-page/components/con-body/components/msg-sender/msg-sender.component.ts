import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../../../../state'

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-sender.component.scss',
  templateUrl: './msg-sender.component.html',
  selector: 'app-msg-sender'
})
export class MsgSenderComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)

  public readonly inProgressMessageSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.IN_PROGRESS_MSGS)
  public readonly selectedConversationIdSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ID);


  // FIXME: TODO: Both of this handlers, should be "improved" in a way, that they are "saving" "sending" messages for a given conversation.
  public textAreaInputChangeHandler($event: Event) {
    const value = ($event?.target as HTMLTextAreaElement).value
    const conversationId = this.selectedConversationIdSg()

    if(conversationId)
    // TODO: (future improvements) debounce the input 
    this._store.dispatch(state.core.con.actions.Con.Ui.MessageSender.TextArea.Input.actions.changed({ conversationId, messageText: value }))
  }

  public readonly selectedInProgressMessageSg = ngCore.computed(() => {
    const inProgressMessages = this.inProgressMessageSg();
    const conversationId = this.selectedConversationIdSg();

    if (!conversationId || !inProgressMessages) {
      return '';
    }
    return inProgressMessages[conversationId] || '';
  });

  public sendButtonClickedHandler() {
    this._store.dispatch(state.core.con.actions.Con.Ui.MessageSender.Buttons.Send.actions.clicked())
  }
}