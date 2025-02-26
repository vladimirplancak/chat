import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as common from '@angular/common'
import * as commonModels from '@common/models'
import * as matIcon from '@angular/material/icon'
import {MatTooltipModule} from '@angular/material/tooltip'
@ngCore.Component({
  standalone: true,
  styleUrl: './msg-list.component.scss',
  templateUrl: './msg-list.component.html',
  selector: 'app-msg-list',
  imports: [common.CommonModule, matIcon.MatIconModule,MatTooltipModule]
})
export class MsgListComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _presentUserLoaderSg = this._store.selectSignal(state.core.user.selectors.User.PRESENT_LOADER)
  public readonly selectedConversationSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.ENTRY)
  public readonly selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  public readonly participantLookupSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP)
  public readonly unreadMessagesIdsSg = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.UNREAD_MESSAGES_IDS)
  public readonly lastSeenMessageIdSg = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.LAST_SEEN_MSG_ID)
  
  public readonly userLookUpSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP) as ngCore.Signal<Partial<Record<commonModels.User.Id, commonModels.User>>>
  public readonly pubConSeenMsgsIdsSg = this._store.selectSignal(state.core.con.selectors.Conversation.Selected.PUB_CON_SEEN_MSGS_STATUS)

  public readonly hasSeenPubMsgUserNameListSg = ngCore.computed(() => {
    const selfId = this.selfIdSg()
    const userLookup = this.userLookUpSg() || {} // Ensure userLookup is always an object
    const seenMsgIds = this.pubConSeenMsgsIdsSg() || {} // Ensure currentUserIds is always an object
    const sortedMsgs = this.messagesSg() || [] // Ensure sortedMsgs is always an array
    
    // Return an empty object if necessary data is not available
    if (!selfId || !Object.keys(userLookup).length || !Object.keys(seenMsgIds).length) {
      return {}
    }
  
    const participantNames: Record<string, string[]> = {}
    const selfPubMsgs = sortedMsgs.filter((msg) => msg?.userId === selfId) // Filter out invalid messages
  
    selfPubMsgs.forEach((msg) => {
      const messageId = msg?.id
      if (!messageId) return // Skip invalid messages
  
      // Check if seenMsgIds contains the messageId
      if (seenMsgIds[messageId]) {
        const participantIds = seenMsgIds[messageId] || []
       
        // Map user IDs to names, filtering out undefined or null values
        const names = participantIds
          .map((userId) => userLookup[userId]?.name || null)
          .filter((name): name is string => name !== null)
  
        participantNames[messageId] = names
      } else {
        participantNames[messageId] = []
      }
    })
  
    return participantNames
  })
  
  
  public readonly lastestSelfMessageIdSg = ngCore.computed(()=>{
    const selfId = this.selfIdSg()
    const filteredMessagesSg = this.messagesSg().filter(msg => msg.userId === selfId)
    const msgLength = filteredMessagesSg.length -1
    const latestMsg = filteredMessagesSg[msgLength]
    return latestMsg?.id 
  })

  
  
  public readonly messagesSg = ngCore.computed(() => {
    const selectedConversation = this.selectedConversationSg()

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
    //console.log(`sortedMessagesSg`, sortedMessagesSg)
    return sortedMessagesSg
  })


  public readonly presentLoaderSg = ngCore.computed((
    loaderForUsers = this._presentUserLoaderSg(),
    loaderForMessagesInCon = this._store.selectSignal(state.core.con.selectors.Message.InSelectedCon.PRESENT_LOADER)()
  ) =>
    loaderForMessagesInCon || loaderForUsers
  )
  
  public readonly isConPrivate = ngCore.computed((
    conType = this.selectedConversationSg(),
  ) => {
        if(conType && conType.participantIds?.length){
          return conType.participantIds.length
        }
        return 0
    }
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