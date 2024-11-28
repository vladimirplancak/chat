import * as ngCore from '@angular/core'
import * as router from '@angular/router'
import * as ngrxStore from '@ngrx/store'
import * as authState from '../../state' 

export const isClientAuthenticatedGuard: router.CanActivateFn = (route, state) => {
  const _store = ngCore.inject(ngrxStore.Store)
  const routerInstance = ngCore.inject(router.Router)

  const isAuthenticated = _store.selectSignal(authState.core.auth.selectors.Auth.SELF_ID)

  if (isAuthenticated()) {
    return true 
  } else {
    routerInstance.navigate(['/login'],{ replaceUrl: true })
    return false 
  }
}
