import * as ngCore from '@angular/core';
import * as components from './components'

@ngCore.Component({
  imports: [
    components.conversationItem.Component,
  ],
  standalone: true,
  styleUrl: './conversation-list.component.scss',
  templateUrl: './conversation-list.component.html',
  selector: 'app-conversation-list'
})
export class ConversationListComponent {
  public readonly conversationsSg: ngCore.Signal<string[]> = ngCore.signal<string[]>([
    'con-1',
    'con-2',
    'con-3',
    'con-4',
    'con-5',
  ]);
}