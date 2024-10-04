
import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as models from '../../../../../../../models'
import { KeyValuePipe } from '@angular/common'


@ngCore.Component({
  selector: 'app-user-selector-dialog',
  standalone: true,
  imports: [
    KeyValuePipe
  ],
  templateUrl: './user-selector-dialog.component.html',
  styleUrl: './user-selector-dialog.component.scss'
})
export class UserSelectorDialogComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  public readonly userListSg = ngCore.computed((
    allUSers = this._store.selectSignal(state.core.user.selectors.User.USERS)(),
    _selfId = this._selfIdSg()
  ) => allUSers.filter((user) => user.id !== _selfId))

  
  public onUserItemClickedHandler(user: models.User) {
    const selfId = this._selfIdSg()
    if (selfId) {
      const payload = {
        name: user.id,
        participantIds: [user.id, selfId]
      }

      this._store.dispatch(state.core.con.actions.Con.Api.Con.Create.actions.started({ input: payload }))
    }
  }
}
