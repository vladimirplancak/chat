import * as ngCore from '@angular/core'
import * as ngRouter from '@angular/router'
import * as ngrxEffects from '@ngrx/effects'
import * as ngrxStore from '@ngrx/store'  
import * as core from './core'
import * as ngrxStoreDevtools from '@ngrx/store-devtools'
import * as services from './services';
import * as ngrxRouterStore from '@ngrx/router-store';

@ngCore.NgModule({
  imports: [
    /* ----------------------- General store registration ----------------------- */
     ngrxStore.StoreModule.forRoot({
      router: ngrxRouterStore.routerReducer
     }),
     ngrxEffects.EffectsModule.forRoot(),
    
    /* ------------------------- User state registration ------------------------ */
    ngrxStore.StoreModule.forFeature(
      core.user.State.FEATURE_KEY,
      core.user.State.REDUCER
    ),
    ngrxEffects.EffectsModule.forFeature([core.user.Effects]),

    /* --------------------- Conversation state registration -------------------- */
    ngrxStore.StoreModule.forFeature(
      core.con.State.FEATURE_KEY,
      core.con.State.REDUCER
    ),
    ngrxEffects.EffectsModule.forFeature([core.con.Effects]),

    
    // Connects RouterModule with StoreModule, uses MinimalRouterStateSerializer by default
    ngrxRouterStore.StoreRouterConnectingModule.forRoot(),

    /* -------------------------- Dev tool registration ------------------------- */
    // NOTE: this might need to be disabled on production
     ngrxStoreDevtools.StoreDevtoolsModule.instrument({
      serialize: {
        options: {
          map: true,
          set: true,
        },
      },
     })
  ],
  providers: [
    services.UserApiService,
    services.ConApiService
  ],
})
export class StateModule {

}