import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';

@ngCore.Component({
  imports: [ngRouter.RouterOutlet],
  standalone: true,
  styleUrl: './conversations-page.component.scss',
  templateUrl: './conversations-page.component.html',
  selector: 'app-channels-page'
})
export class ConversationsPageComponent {
}