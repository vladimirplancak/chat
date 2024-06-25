import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';

import { ROUTES } from './app.routes';

export const CONFIG: ngCore.ApplicationConfig = {
  providers: [
    ngCore.provideZoneChangeDetection({ eventCoalescing: true }), 
    ngRouter.provideRouter(ROUTES)
  ]
};
