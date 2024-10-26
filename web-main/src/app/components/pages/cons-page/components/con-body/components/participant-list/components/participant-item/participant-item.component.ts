import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../../../../../../../models';
import * as matIcon from '@angular/material/icon';
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
  public readonly hoveredParticipantIdSg = this._store.selectSignal(state.core.con.selectors.Conversation.HoveredParticipant.ID)
  public readonly selfIdSg = this._store.selectSignal(state.core.auth.selectors.Auth.SELF_ID)
  
  public onParticipantHovered(participant: models.User) {
      this._store.dispatch(state.core.con.actions.Con.Ui.MouseEvent.Participant.actions.hovered({ participantId: participant.id }))
  }

  public onParticipantUnHovered(participant: models.User) {
      this._store.dispatch(state.core.con.actions.Con.Ui.MouseEvent.Participant.actions.unHovered({ participantId: participant.id }))
  }

  public onParticipantRemoveButtonClickHandler(participantId: models.User.Id) {
    this._store.dispatch(state.core.con.actions.Con.Ui.List.Buttons.RemoveParticipant.actions.clicked({ participantId: participantId }))
  }
}