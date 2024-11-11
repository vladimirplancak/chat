import * as ngCore from '@angular/core'
import * as forms from '@angular/forms'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'
import * as state from '../../../state'
@ngCore.Component({
  standalone: true,
  styleUrl: './login-page.component.scss',
  templateUrl: './login-page.component.html',
  selector: 'app-login-page',
  imports: [
    forms.FormsModule
  ]
})
export class LoginPageComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  public username: string = '';
  public password: string = '';

  onSubmit() {
    const loginRequest: models.Auth.Request = { username: this.username, password: this.password };
    this._store.dispatch(state.core.auth.actions.Auth.Ui.LoginForm.actions.submitted(loginRequest));
  }


}