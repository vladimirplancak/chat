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

  public readonly inProgressMessageSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.IN_PROGRESS_MSG)

  // FIXME: TODO: Both of this handlers, should be "improved" in a way, that they are "saving" "sending" messages for a given conversation.
  public textAreaInputChangeHandler($event: Event) {
    const value = ($event?.target as HTMLTextAreaElement).value
    
    // TODO: (future improvements) debounce the input 
    console.log(`component/value`, value)
    this._store.dispatch(state.core.con.actions.Con.Ui.MessageSender.TextArea.Input.actions.changed({ messageText: value }))
  }

  public sendButtonClickedHandler() {
    this._store.dispatch(state.core.con.actions.Con.Ui.MessageSender.Buttons.Send.actions.clicked())
  }
}