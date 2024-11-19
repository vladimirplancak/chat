import { FlexibleConnectedPositionStrategy, Overlay, OverlayModule } from '@angular/cdk/overlay';
import * as ngCore from '@angular/core';

@ngCore.Component({
  imports: [OverlayModule],
  selector: 'right-attached-overlay',
  standalone: true,
  template: `
    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOpen]="true"
      [cdkConnectedOverlayHasBackdrop]="hasBackdropSg()"
      [cdkConnectedOverlayBackdropClass]="backdropClassSg()"
      [cdkConnectedOverlayPositionStrategy]="positionSg"
      (overlayOutsideClick)="backdropClick.emit($event)"
    >
      <ng-content></ng-content>
    </ng-template>
  `,
})
export class RightAttachedOverlayComponent {
  private readonly _overlay = ngCore.inject(Overlay);

  // FlexibleConnectedPositionStrategy is always defined
  public readonly positionSg: FlexibleConnectedPositionStrategy = this._overlay
    .position()
    .flexibleConnectedTo({ x: 0, y: 0 }) // Default position, updated when origin is set
    .withPositions([
      {
        originX: 'end',
        originY: 'top',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: 0,
        offsetY: 20,
      },
    ])
    .withPush(true); // Now this method works with FlexibleConnectedPositionStrategy

  public readonly hasBackdropSg = ngCore.input<boolean>(true, { alias: 'hasBackdrop' });
  public readonly backdropClassSg = ngCore.input<string>('overlay-backdrop-class', { alias: 'backdropClass' });
  public readonly backdropClick = ngCore.output<MouseEvent>();

  @ngCore.Input('origin')
  set origin(value: HTMLElement | null) {
    if (value) {
      this.positionSg.setOrigin(value);
    }
  }
}
