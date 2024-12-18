import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../../../../state'
import * as models from '../../../../../../../models'
import * as services from '../../../../../../../state/services'
import * as rxjs from 'rxjs'
import { AsyncPipe } from '@angular/common';

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-list.component.scss',
  templateUrl: './msg-list.component.html',
  selector: 'app-msg-list',
  //imports:[AsyncPipe] seems to be unused.
})
export class MsgListComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _presentUserLoaderSg = this._store.selectSignal(state.core.user.selectors.User.PRESENT_LOADER)

  public readonly messagesSg = ngCore.computed(() => {
    const selectedConversation = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)()
   
    // If the selected conversation is not present, we are not able to display
    // any messages from that conversation, thus we return the empty array (no
    // messages).
    if (!selectedConversation) {
      return []
    }

    // If the selected conversation is preset, but the list of participants is
    // still loading, meaning, that users for that conversation are not yet loader, 
    // we return the empty array (no messages). Note, that this only covers the case
    // where the participants that actually sent th messages are not yet loaded.
    const participantIds = selectedConversation.participantIds
    const filteredUsers = this._store.selectSignal(state.core.user.selectors.User.USERS_FILTERED({userIdOrIds: participantIds}))()
    if (filteredUsers.length !== participantIds?.length) {
      return []
    }

    return selectedConversation.messages
  })


  public readonly participantLookupSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP)

  public readonly presentLoaderSg = ngCore.computed((
    loaderForUsers = this._presentUserLoaderSg(),
    loaderForMessagesInCon = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.PRESENT_LOADER)()
  ) =>
    loaderForMessagesInCon || loaderForUsers
  )

  public selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)

}