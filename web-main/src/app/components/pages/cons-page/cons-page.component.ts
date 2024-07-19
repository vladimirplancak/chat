import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';
import * as components from './components'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../state'

@ngCore.Component({
  imports: [
    components.conList.Component,
    components.conHeader.Component,
    components.conBody.Component,
    ngRouter.RouterOutlet,
  ],
  standalone: true,
  styleUrl: './cons-page.component.scss',
  templateUrl: './cons-page.component.html',
  selector: 'app-cons-page'
})
export class ConsPageComponent implements ngCore.OnInit {
  private readonly _store = ngCore.inject(ngrxStore.Store)

  ngOnInit(): void {
    this._store.dispatch(state.core.root.actions.Root.Ui.actions.initialized())
  }
}