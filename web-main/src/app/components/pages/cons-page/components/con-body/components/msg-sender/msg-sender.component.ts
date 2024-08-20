import * as ngCore from '@angular/core';

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-sender.component.scss',
  templateUrl: './msg-sender.component.html',
  selector: 'app-msg-sender'
})
export class MsgSenderComponent {
  
 
  public onTextAreContentChanged(event: any) {
    // TODO: dispatch send action
    console.log(event)
  }
}