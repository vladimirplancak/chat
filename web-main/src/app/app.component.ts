import * as ngCore from '@angular/core'
import * as ngRouter from '@angular/router'
import { MatButtonModule } from '@angular/material/button'

@ngCore.Component({
  selector: 'app-root',
  standalone: true,
  imports: [ 
    MatButtonModule,
    ngRouter.RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
}
