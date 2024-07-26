import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../../../../state'


@ngCore.Component({
    standalone: true,
    styleUrl: './msg-list.component.scss',
    templateUrl: './msg-list.component.html',
    selector: 'app-msg-list',
})
export class MsgListComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  
  public readonly messagesSg = this._store.selectSignal(state.core.con.selectors.Conversation.MESSAGES)
  public readonly participantLookupSg = this._store.selectSignal(state.core.user.selectors.User.USERS_LOOKUP)
}