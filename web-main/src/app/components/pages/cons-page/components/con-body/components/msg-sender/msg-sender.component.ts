import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as conversation from '../../../../../../../state/core/conversation/conversation.actions'
import * as state from '../../../../../../../state'
import { Conversation } from '../../../../../../../models/conversation';
import { ConApiService } from '../../../../../../../state/services';

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-sender.component.scss',
  templateUrl: './msg-sender.component.html',
  selector: 'app-msg-sender'
})
export class MsgSenderComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _conApiService = ngCore.inject(ConApiService)
  private readonly _selectedConIdSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ID)
  private readonly _currentlyLoggedUserIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  message: string = ''

  public onTextAreaContentChanged($event: Event) {
    this.message = ($event?.target as HTMLTextAreaElement).value
    console.log(`typing event:`, this.message)
  }


  public sendMessage() {
    //prepare the payload
    const payloadMessage: Conversation.MessageWithConversation = {
      conversationId: this._selectedConIdSg() || '',
      message: {
        id:'6',
        userId: this._currentlyLoggedUserIdSg() || '',
        content: this.message,
        datetime: new Date()
      }
    }
    console.log(`payloadMessage`, payloadMessage)
    //invoke the service method
    this._conApiService.sendConMessage(payloadMessage);
    //dispach the action
    this._store.dispatch(conversation.Con.Api.Subscriptions.actions.sendMessageStarted({ message: payloadMessage })) 
 
  }
}