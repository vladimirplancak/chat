import * as ngCore from '@angular/core'
import * as ngrxEffects from '@ngrx/effects'
import * as ngrxStore from '@ngrx/store'  
import * as core from './core'
import * as ngrxStoreDevtools from '@ngrx/store-devtools'

ngCore.NgModule({
  imports: [
    /* ------------------------- User state registration ------------------------ */
    ngrxStore.StoreModule.forFeature(
      core.user.State.FEATURE_KEY,
      core.user.State.REDUCER
    ),
    ngrxEffects.EffectsModule.forFeature([core.user.Effects]),

    /* ----------------------- General store registration ----------------------- */
    ngrxStore.StoreModule.forRoot(),
    ngrxEffects.EffectsModule.forRoot(),
    
    /* -------------------------- Dev tool registration ------------------------- */
    // NOTE: this might need to be disabled on production
    ngrxStoreDevtools.StoreDevtoolsModule.instrument()
  ],
})
export class StateModule {

}