import * as ngCore from '@angular/core'
import * as ngrxEffects from '@ngrx/effects'
import * as ngrxStore from '@ngrx/store'  
import * as core from './core'
import * as ngrxStoreDevtools from '@ngrx/store-devtools'
import * as services from './services';
import * as ngrxRouterStore from '@ngrx/router-store';
import { HttpClientModule } from '@angular/common/http'

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

    /* ------------------------- Auth state registration ------------------------ */
    ngrxStore.StoreModule.forFeature(
      core.auth.State.FEATURE_KEY,
      core.auth.State.REDUCER
    ),
    ngrxEffects.EffectsModule.forFeature([core.auth.Effects]),

    
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
     }),
     HttpClientModule,
  ],
  providers: [
    services.UserApiService,
    services.ConApiService,
    services.AuthApiService
  ],
})
export class StateModule {

}