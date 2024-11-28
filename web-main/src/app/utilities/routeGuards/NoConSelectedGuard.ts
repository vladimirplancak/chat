import * as ngCore from '@angular/core'
import * as router from '@angular/router'
import * as ngrxStore from '@ngrx/store'
import * as conState from '../../state' 

export const conversationGuard: router.CanActivateFn = (route, state) => {
  const _store = ngCore.inject(ngrxStore.Store)
  const routerInstance = ngCore.inject(router.Router)

  const conversationId = route.params['conversationId']

  const conversationExistsSignalSg = _store.selectSignal(conState.core.con.selectors.Conversation.CON_EXISTS(conversationId))
  
  if (conversationExistsSignalSg()) {
    return true 
  } else {
    routerInstance.navigate(['/conversations/no-con-selected'])
    return false 
  }
}
