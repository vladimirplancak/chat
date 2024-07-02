import * as ngCore from '@angular/core';
import * as components from './components'
import { ParticipantListComponent } from "./components/participant-list/participant-list.component";

@ngCore.Component({
    standalone: true,
    styleUrl: './conversation-item.component.scss',
    templateUrl: './conversation-item.component.html',
    selector: 'app-conversation-item',
    imports: [
        components.messageList.Component,
        components.participantList.participantItem.Component,
        components.messageSender.Component,
        ParticipantListComponent
    ]
})
export class ConversationItemComponent {

}