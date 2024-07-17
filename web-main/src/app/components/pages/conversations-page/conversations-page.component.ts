import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';
import * as components from './components'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../state'

@ngCore.Component({
  imports: [
    components.conversationList.Component,
    components.conversationsHeader.Component,
    components.conversationItem.Component,
    ngRouter.RouterOutlet,
  ],
  standalone: true,
  styleUrl: './conversations-page.component.scss',
  templateUrl: './conversations-page.component.html',
  selector: 'app-channels-page'
})
export class ConversationsPageComponent implements ngCore.OnInit {
  private readonly _store = ngCore.inject(ngrxStore.Store)


  ngOnInit(): void {
    this._store.dispatch(state.core.user.actions.User.Ui.Root.actions.initialized())
  }
}