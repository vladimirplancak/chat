
import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as models from '../../../../../../../models'

@ngCore.Component({
  selector: 'app-user-selector-dialog',
  standalone: true,
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
    this._store.dispatch(state.core.con.actions.Con.Ui.UserSelectorDialog.actions.selected({ userId: user.id }))
  }
}
