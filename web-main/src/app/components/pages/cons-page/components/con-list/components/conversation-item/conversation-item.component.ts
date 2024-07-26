import * as ngCore from '@angular/core';
import * as models from '../../../../../../../models';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../../../../state'

@ngCore.Component({
  standalone: true,
  styleUrl: './conversation-item.component.scss',
  templateUrl: './conversation-item.component.html',
  selector: 'app-conversation-item'
})
export class ConversationItemComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store);
  public readonly selectedConversationIdSg = this._store.selectSignal(state.core.con.selectors.Conversation.SELECTED_ID)
  public readonly conversationSg = ngCore.input.required<models.Conversation>({alias: 'conversation'});

}