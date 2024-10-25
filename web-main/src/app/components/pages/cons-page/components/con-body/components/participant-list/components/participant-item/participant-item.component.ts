import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../../../../../../../models';
import * as matIcon from '@angular/material/icon';
import * as con from '../../../../../../../../../state/core/conversation/conversation.actions'
import * as state from '../../../../../../../../../state'

@ngCore.Component({
  imports: [matIcon.MatIconModule],
  standalone: true,
  styleUrl: './participant-item.component.scss',
  templateUrl: './participant-item.component.html',
  selector: 'app-participant-item'
})
export class ParticipantItemComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)

  public readonly participantSg = ngCore.input.required<models.User>({ alias: 'participant' })
  public readonly isOnlineSg = ngCore.input.required<boolean>({ alias: 'isOnline' })
  public readonly _hoveredParticipantId = this._store.selectSignal(state.core.con.selectors.Conversation.HoveredParticipant.ID)
  
  onParticipantHovered(hoveredParticipantId: string | undefined) {
      this._store.dispatch(con.Con.Ui.MouseEvent.Participant.actions.hovered({ hoveredParticipantId: hoveredParticipantId }))
  }

  onUserRemoveMouseClick(userId: string) {
    this._store.dispatch(con.Con.Ui.List.Buttons.RemoveParticipant.actions.clicked({ participantId: userId }))
  }
}