import * as ngCore from '@angular/core';

@ngCore.Component({
  standalone: true,
  styleUrl: './conversation-item.component.scss',
  templateUrl: './conversation-item.component.html',
  selector: 'app-conversation-item'
})
export class ConversationItemComponent {
  
  public readonly conversationSg = ngCore.input.required<string>({alias: 'conversation'});
}