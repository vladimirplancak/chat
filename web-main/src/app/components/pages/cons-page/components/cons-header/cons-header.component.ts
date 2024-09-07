import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../state'
import * as models from '../../../../../models'

@ngCore.Component({
  standalone: true,
  styleUrl: './cons-header.component.scss',
  templateUrl: './cons-header.component.html',
  selector: 'app-cons-header'
})
export class ConsHeaderComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  public readonly selfSg  = ngCore.computed(() => {
    const lookup = this._store.selectSignal(state.core.user.selectors.User.USERS_LOOKUP)()
    const selfId = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)()

    return selfId 
      ? lookup[selfId] 
      : undefined
  })
  
}