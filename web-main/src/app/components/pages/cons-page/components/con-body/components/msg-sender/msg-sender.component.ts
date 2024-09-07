import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as conversation from '../../../../../../../state/core/conversation/conversation.actions'
import * as state from '../../../../../../../state'
import { Conversation } from '../../../../../../../models/conversation';
import { ConApiService } from '../../../../../../../state/services';
import * as models from '../../../../../../../models/'

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-sender.component.scss',
  templateUrl: './msg-sender.component.html',
  selector: 'app-msg-sender'
})
export class MsgSenderComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)
  public message: string = ''

  public sendButtonClickedHandler($event: Event) {
    this.message = ($event?.target as HTMLTextAreaElement).value
    console.log(`typing event:`, this.message)
  }

  public sendMessage() {

    this._store.dispatch(conversation.Con.Api.Subscriptions.actions.messageReceivedStarted({ message: this.message })) 
 
  }
}