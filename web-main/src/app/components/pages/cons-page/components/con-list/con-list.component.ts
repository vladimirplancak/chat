import * as ngCore from '@angular/core';
import * as components from './components'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../state'
import * as models from '../../../../../models'
import * as ngRouter from '@angular/router'
import * as common from '../../../../common'

@ngCore.Component({
  imports: [
    components.conversationItem.Component,
    common.overlay.centered.Component,
    
  ],
  standalone: true,
  styleUrl: './con-list.component.scss',
  templateUrl: './con-list.component.html',
  selector: 'app-con-list'
})
export class ConListComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _router = ngCore.inject(ngRouter.Router)
  public readonly conListSg = this._store.selectSignal(state.core.con.selectors.Conversation.CONS)
  public readonly presentLoaderSg = this._store.selectSignal(state.core.con.selectors.Conversation.PRESENT_LOADER)


  public conItemClickHandler(selectedId: models.Conversation.Id): void {
    this._router.navigate(['conversations', selectedId])
    this._store.dispatch(state.core.con.actions.Con.Ui.List.ConItem.actions.clicked({ selectedId }))
  }
}