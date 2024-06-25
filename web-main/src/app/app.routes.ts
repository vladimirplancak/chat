import * as ngRouter from '@angular/router';
import * as components from './components'
import * as ngCore from '@angular/core';


@ngCore.Component({
  template: 'TODO: implement page',
  standalone: true,
  selector: 'app-page-not-implemented'
})
export class PageNotImplementedComponent { }

// TODO: - We need to care about logged in user can access logged in parts of the application
export const ROUTES: ngRouter.Routes = [
  { path: 'sign-up', component: components.pages.signUpPage.Component },
  { path: 'login', component: components.pages.loginPage.Component },
  {
    path: 'conversations', component: components.pages.conversationsPage.Component,
    children: [
      { path: ':conversationId', component: PageNotImplementedComponent }
    ],
  },
  { path: 'error', component: components.pages.errorPage.Component },
  // NOTE: If everything is fine we want to redirect a user to a page, that is
  // actually expected in 90% of the cases.
  { path: '', pathMatch: 'full', redirectTo: 'channels' },
  // NOTE: whenever we hit a route that doesn't exist, we will redirect to the
  // error page
  { path: '**', pathMatch: 'full', redirectTo: 'error' },
]



