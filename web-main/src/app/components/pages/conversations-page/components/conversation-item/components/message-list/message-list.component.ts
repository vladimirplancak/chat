import * as ngCore from '@angular/core';
import { MessageSenderComponent } from "../message-sender/message-sender.component";

@ngCore.Component({
    standalone: true,
    styleUrl: './message-list.component.scss',
    templateUrl: './message-list.component.html',
    selector: 'app-message-list',
    imports: [MessageSenderComponent]
})
export class MessageListComponent {
  
 
}