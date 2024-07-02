import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';
import * as components from './components'

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
export class ConversationsPageComponent {
}