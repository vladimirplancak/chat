import * as ngCore from '@angular/core'
import * as forms from '@angular/forms'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'
import * as state from '../../../state'
import * as common from '@angular/common'
@ngCore.Component({
  standalone: true,
  styleUrl: './login-page.component.scss',
  templateUrl: './login-page.component.html',
  selector: 'app-login-page',
  imports: [
    forms.FormsModule, 
    common.CommonModule
  ]
})
export class LoginPageComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  public readonly _authErrMsgSg = this._store.selectSignal(state.core.auth.selectors.Auth.AUTH_ERR_MSG)
  public username: string = '';
  public password: string = '';

  onSubmit() {
    const loginRequest: models.Auth.Request = { username: this.username, password: this.password };
    this._store.dispatch(state.core.auth.actions.Auth.Ui.LoginForm.actions.submitted(loginRequest));
  }


}