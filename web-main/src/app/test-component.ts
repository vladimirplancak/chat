import * as ngCore from '@angular/core'

@ngCore.Component({
  template: `test works: <ng-content />`,
  selector: 'app-test',
  standalone: true,
})
export class TestComponent {

}