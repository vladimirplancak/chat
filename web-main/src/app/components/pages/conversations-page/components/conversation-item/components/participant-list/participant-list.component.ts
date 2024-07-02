import * as ngCore from '@angular/core';
import * as components from './components'

@ngCore.Component({
  imports:[
    components.participantItem.Component
  ],
  standalone: true,
  styleUrl: './participant-list.component.scss',
  templateUrl: './participant-list.component.html',
  selector: 'app-participant-list'
})
export class ParticipantListComponent {
  
  public readonly participantsSg: ngCore.Signal<string[]> = ngCore.signal<string[]>([
    'participant-1',
    'participant-2',
    'participant-3',
    'participant-4',
    'participant-5',
  ])
 
}