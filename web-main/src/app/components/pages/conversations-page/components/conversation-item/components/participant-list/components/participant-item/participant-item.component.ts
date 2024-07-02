import * as ngCore from '@angular/core';

@ngCore.Component({
  standalone: true,
  styleUrl: './participant-item.component.scss',
  templateUrl: './participant-item.component.html',
  selector: 'app-participant-item'
})
export class ParticipantItemComponent {
  
  public readonly participantSg = ngCore.input.required<string>({alias: 'participant'});
  
  
}