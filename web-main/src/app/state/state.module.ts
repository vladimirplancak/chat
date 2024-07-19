import * as ngCore from '@angular/core'
import * as ngrxEffects from '@ngrx/effects'
import * as ngrxStore from '@ngrx/store'  
import * as core from './core'
import * as ngrxStoreDevtools from '@ngrx/store-devtools'
import * as services from './services';

@ngCore.NgModule({
  imports: [
    /* ----------------------- General store registration ----------------------- */
     ngrxStore.StoreModule.forRoot(),
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

    
    /* -------------------------- Dev tool registration ------------------------- */
    // NOTE: this might need to be disabled on production
     ngrxStoreDevtools.StoreDevtoolsModule.instrument()
  ],
  providers: [
    services.UserApiService,
    services.ConApiService
  ],
})
export class StateModule {

}