import * as ngCore from '@angular/core'
import * as ngrxStore from '@ngrx/store'
import * as state from '../../../../../../../state'
import * as models from '../../../../../../../models'


@ngCore.Component({
    selector: 'app-info-selector-dialog',
    standalone: true,
    templateUrl: './user-info-dialog.component.html',
    styleUrl: './user-info-dialog.component.scss'
  })

  export class UserSelectorInfoComponent{
    
    onSelfLogOutBtnClick() {
    throw new Error('Method not implemented.')
  }

  }