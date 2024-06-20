import * as ngCore from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { TestComponent } from './test-component'
import * as models from './models'
import * as components from './components'

@ngCore.Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    MatButtonModule, 
    TestComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
