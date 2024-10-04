import { OverlayModule } from '@angular/cdk/overlay';
import * as ngCore from '@angular/core';

@ngCore.Component({
  imports: [OverlayModule],
  selector: 'attached-overlay',
  standalone: true,
  template: `
    @if(originSg(); as origin) {
      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="origin"
        [cdkConnectedOverlayOpen]="true"
        [cdkConnectedOverlayHasBackdrop]="hasBackdropSg()"
        [cdkConnectedOverlayOffsetX]="offsetXSg()"
        [cdkConnectedOverlayOffsetY]="offsetYSg()"
          (overlayOutsideClick)="$event.stopPropagation(); backdropClick.emit($event)"
      >
        <ng-content></ng-content> 
      </ng-template>
    }
  `
})
export class AttachedOverlayComponent {
  public originSg = ngCore.input<HTMLElement | undefined>(undefined, { alias: 'origin' })
  public offsetXSg = ngCore.input<number>(0, { alias: 'offsetX' })
  public offsetYSg = ngCore.input<number>(0, { alias: 'offsetY' })
  public hasBackdropSg = ngCore.input<boolean>(false, { alias: 'hasBackdrop' })
  public backdropClassSg = ngCore.input<string>('', { alias: 'backdropClass' })
  public backdropClick = ngCore.output<MouseEvent>()
}