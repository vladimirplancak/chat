import * as ngCore from '@angular/core';
import * as components from './components'

@ngCore.Component({
  imports: [
    components.conversationItem.Component,
  ],
  standalone: true,
  styleUrl: './con-list.component.scss',
  templateUrl: './con-list.component.html',
  selector: 'app-con-list'
})
export class ConListComponent {
  public readonly conversationsSg: ngCore.Signal<string[]> = ngCore.signal<string[]>([
    'con-1',
    'con-2',
    'con-3',
    'con-4',
    'con-5',
  ]);
}