import * as ngCore from '@angular/core';
import * as ngRouter from '@angular/router';
import * as state from './state'

import { ROUTES } from './app.routes';

export const CONFIG: ngCore.ApplicationConfig = {
  providers: [
    // Registering ngrx in our application.
     ngCore.importProvidersFrom(state.Module),
    // ngCore.provideZoneChangeDetection({ eventCoalescing: true }), 
     ngRouter.provideRouter(ROUTES)
  ]
};
