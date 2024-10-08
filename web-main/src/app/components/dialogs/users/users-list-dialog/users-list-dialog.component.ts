import { Component } from '@angular/core';
import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../state'
import { User } from '../../../../models/user';
import { Con } from '../../../../state/core/conversation/conversation.actions';


@Component({
  selector: 'app-users-list-dialog',
  standalone: true,
  imports: [],
  templateUrl: './users-list-dialog.component.html',
  styleUrl: './users-list-dialog.component.scss'
})
export class UsersListDialogComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  public readonly usersListSg = this._store.selectSignal(state.core.user.selectors.User.USER_LOOKUP)()
  private readonly currentlyLoggedUser = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)()

  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  onUserSelected(userId: User.Id | undefined) {
    //need to dispatch an action here which will have a payload of user id 
    console.log(userId)
    if (userId && this.currentlyLoggedUser) {
      const payload = {
        name: userId,
        participantIds: [userId, this.currentlyLoggedUser]
      }
     
    }

  }
}
