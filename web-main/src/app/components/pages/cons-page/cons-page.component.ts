import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';
import * as components from './components'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../state'
import * as ngrxRouterStore from '@ngrx/router-store'
const {
  selectRouteParam, // factory function to select a route param
} = ngrxRouterStore.getRouterSelectors();


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
    const urlConvoParam =  selectRouteParam('conversationId')
    console.log(urlConvoParam)
    
    this._store.select(urlConvoParam).subscribe(urlConvoParam => {
      console.log(urlConvoParam);
      
    });
    this._store.dispatch(state.core.root.actions.Root.Ui.actions.initialized())
    this._store.dispatch(state.core.root.actions.Root.Ui.actions.extractCurrentURLParam({conversationId: '1'}))
  }
}