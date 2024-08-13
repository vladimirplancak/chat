import * as ngCore from '@angular/core';
import * as models from '../../../../../../../../../models';

@ngCore.Component({
  standalone: true,
  styleUrl: './participant-item.component.scss',
  templateUrl: './participant-item.component.html',
  selector: 'app-participant-item'
})
export class ParticipantItemComponent {
  
  public readonly participantSg = ngCore.input.required<models.User>({alias: 'participant'})
  public readonly isOnlineSg = ngCore.input.required<boolean>({alias: 'isOnline'})
  
}