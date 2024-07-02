import * as ngCore from '@angular/core';
import * as components from './components'

@ngCore.Component({
    standalone: true,
    styleUrl: './conversation-item.component.scss',
    templateUrl: './conversation-item.component.html',
    selector: 'app-conversation-item',
    imports: [
        components.messageList.Component,
        components.participantList.Component,
        components.messageSender.Component,
    ]
})
export class ConversationItemComponent {

}