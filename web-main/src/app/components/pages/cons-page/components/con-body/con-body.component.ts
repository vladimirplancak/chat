import * as ngCore from '@angular/core';
import * as components from './components'

@ngCore.Component({
    standalone: true,
    styleUrl: './con-body.component.scss',
    templateUrl: './con-body.component.html',
    selector: 'app-con-body',
    imports: [
        components.msgList.Component,
        components.participantList.Component,
        components.msgSender.Component,
    ]
})
export class ConBodyComponent {

}