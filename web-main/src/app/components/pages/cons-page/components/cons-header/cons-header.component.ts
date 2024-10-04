import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../state'
import { MatDialog } from '@angular/material/dialog';
import { UsersListDialogComponent } from '../../../../dialogs/users/users-list-dialog/users-list-dialog.component'

@ngCore.Component({
  standalone: true,
  styleUrl: './cons-header.component.scss',
  templateUrl: './cons-header.component.html',
  selector: 'app-cons-header'
})
export class ConsHeaderComponent {

  constructor(public dialog:MatDialog) {}

  private readonly _store = ngCore.inject(ngrxStore.Store)

  
  public readonly selfSg = ngCore.computed((
    lookup = this._store.selectSignal(state.core.user.selectors.User.USERS_LOOKUP)(),
    selfId = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)()
  ) => selfId
      ? lookup[selfId]
      : undefined
  )

  openDialog(): void {
    const dialogRef = this.dialog.open(UsersListDialogComponent, {
      width: '250px',
      data: { message: 'hello from the dialog' }, 
    });}

}