import * as ngPlatformBrowser from '@angular/platform-browser';
import * as app from './app'

ngPlatformBrowser.bootstrapApplication(app.Component, app.CONFIG)
  .catch((err) => console.error(err));
