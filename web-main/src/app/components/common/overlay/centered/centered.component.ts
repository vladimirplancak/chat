import { FlexibleConnectedPositionStrategy, GlobalPositionStrategy, Overlay, OverlayModule } from '@angular/cdk/overlay';
import * as ngCore from '@angular/core';
import * as ngCommon from '@angular/common'

@ngCore.Component({
  imports: [OverlayModule],
  selector: 'centered-overlay',
  standalone: true,
  template: `
    
      
        <ng-template
          cdkConnectedOverlay
          [cdkConnectedOverlayOpen]="true"
          [cdkConnectedOverlayBackdropClass]="backdropClassSg()"
          [cdkConnectedOverlayHasBackdrop]="hasBackdropSg()"
          [cdkConnectedOverlayPositionStrategy]="positionSg()"
          (overlayOutsideClick)="backdropClick.emit($event)"
        >
          <ng-content></ng-content> 
        </ng-template>
    
  `
})
export class CenteredOverlayComponent {
  private readonly _overlay = ngCore.inject(Overlay)

  public readonly positionSg = ngCore.input<FlexibleConnectedPositionStrategy>(
    this._overlay
    .position()
    .global()
    .centerHorizontally()
    .centerVertically() as unknown as FlexibleConnectedPositionStrategy, {
       alias: 'position' 
  })

 
  public readonly hasBackdropSg = ngCore.input<boolean>(false, { alias: 'hasBackdrop' })
  public readonly backdropClassSg = ngCore.input<string>('overlay-backdrop-class', { alias: 'backdropClass' })
  public readonly backdropClick = ngCore.output<MouseEvent>()
  
}