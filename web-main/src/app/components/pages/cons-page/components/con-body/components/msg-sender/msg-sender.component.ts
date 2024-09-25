import * as ngCore from '@angular/core';
import * as ngrxStore from '@ngrx/store';
import * as state from '../../../../../../../state'

@ngCore.Component({
  standalone: true,
  styleUrl: './msg-sender.component.scss',
  templateUrl: './msg-sender.component.html',
  selector: 'app-msg-sender'
})
export class MsgSenderComponent {

  private readonly _store = ngCore.inject(ngrxStore.Store)
  public message: string = ''

  public textAreaInputChangeHandler($event: Event) {
    // TODO: should be refactored, save temporary message, somewhere ins tate right?
    this.message = ($event?.target as HTMLTextAreaElement).value
    console.log(`typing event:`, this.message)
  }

  public sendButtonClickedHandler() {
    throw new Error('refactor')
    // TODO: this.store.dispatch(state.core.con.actions.Con.Ui.MessageSnder.Buttons.Send.Clicked({ message: this.message }))
  }
}