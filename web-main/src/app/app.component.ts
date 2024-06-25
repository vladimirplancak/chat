import * as ngCore from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import * as models from './models'
import * as components from './components'

@ngCore.Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    MatButtonModule, 
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
