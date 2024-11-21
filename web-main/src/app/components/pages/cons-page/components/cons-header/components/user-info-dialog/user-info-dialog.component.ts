import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as models from '../../../../../../../models'


@ngCore.Component({
  selector: 'app-info-selector-dialog',
  standalone: true,
  templateUrl: './user-info-dialog.component.html',
  styleUrl: './user-info-dialog.component.scss'
})

export class UserSelectorInfoComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)

  public readonly selfUserInformationSG = this._store.selectSignal(state.core.user.selectors.User.SELF_DETAILS)

  onSelfLogOutBtnClick() {
    this._store.dispatch(state.core.auth.actions.Auth.Ui.Buttons.LogOut.actions.started())
  }

}