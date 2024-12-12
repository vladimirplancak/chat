import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as common from '@angular/common'
import * as models from '../../../../../../../models'
import {MatIconModule} from '@angular/material/icon'
@ngCore.Component({
  standalone: true,
  styleUrl: './msg-list.component.scss',
  templateUrl: './msg-list.component.html',
  selector: 'app-msg-list',
  imports: [common.CommonModule, MatIconModule]
})
export class MsgListComponent implements ngCore.OnInit{
  ngOnInit(): void {
    setTimeout(() => {
      // console.log('unreadMessagesIdsSg',this.unreadMessagesIdsSg())
      // console.log('lastSeenMessageIdSg', this.lastSeenMessageIdSg())
    }, 400)
  }

  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _presentUserLoaderSg = this._store.selectSignal(state.core.user.selectors.User.PRESENT_LOADER)
  public readonly selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  public readonly participantLookupSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP)
  public readonly unreadMessagesIdsSg = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.UNREAD_MESSAGES_IDS)
  public readonly lastSeenMessageIdSg = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.LAST_SEEN_MSG_ID)
 

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
    const filteredUsers = this._store.selectSignal(state.core.user.selectors.User.USERS_FILTERED({ userIdOrIds: participantIds }))()
    if (filteredUsers.length !== participantIds?.length) {
      return []
    }

    const messagesCopy = [...selectedConversation.messages]
    const sortedMessagesSg = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.SORT_CON_MESSAGES(messagesCopy))()
    return sortedMessagesSg
  })


  public readonly presentLoaderSg = ngCore.computed((
    loaderForUsers = this._presentUserLoaderSg(),
    loaderForMessagesInCon = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.PRESENT_LOADER)()
  ) =>
    loaderForMessagesInCon || loaderForUsers
  )

  public readonly isMsgSeenMapSg = ngCore.computed((
    unreadMessageIds = this.unreadMessagesIdsSg(),
    lastSeenMessageId = this.lastSeenMessageIdSg(),
    messages = this.messagesSg()
  ) => {

    const seenStatusMap: Record<string, boolean | null> = {}

    for (const msg of messages) {
      if (unreadMessageIds.includes(msg.id)) {
        seenStatusMap[msg.id] = false
      } else if (lastSeenMessageId === msg.id) {
        seenStatusMap[msg.id] = true
      } else {
        seenStatusMap[msg.id] = null
      }
    }

    return seenStatusMap
  })
}