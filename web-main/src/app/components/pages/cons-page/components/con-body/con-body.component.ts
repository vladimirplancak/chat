import * as ngCore from '@angular/core';
import * as components from './components'
import * as ngrxStore from '@ngrx/store'
import * as ngRouter from '@angular/router'
import * as rxjsInterop from '@angular/core/rxjs-interop'
import * as rxjs from 'rxjs'
import * as state from '../../../../../state'

@ngCore.Component({
  standalone: true,
  styleUrl: './con-body.component.scss',
  templateUrl: './con-body.component.html',
  selector: 'app-con-body',
  imports: [
    components.msgList.Component,
    components.participantList.Component,
    components.msgSender.Component,
  ]
})
export class ConBodyComponent {
  private readonly _store = ngCore.inject(ngrxStore.Store)
  private readonly _conversationId$ = 
    ngCore.inject(ngRouter.ActivatedRoute)
      .paramMap
      .pipe(
        rxjs.map(params => params.get('conversationId') ?? undefined)
      )

  constructor() { 
    this._conversationId$
    // TODO: "selectedId is string" should be "selectedId is models.Conversation.Id"
    .pipe(rxjs.filter((selectedId): selectedId is string => selectedId !== undefined))
    .subscribe((selectedId) => {
      this._store.dispatch(
        state.core.con.actions.Con.Ui.Body.actions.initialized({ params: { selectedId } })
      )
    })
  }
}