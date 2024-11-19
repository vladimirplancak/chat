import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const AUTH_SOURCE = 'Auth'

export namespace Auth {
  export namespace Ui {
    export const SOURCE = common.Action.Source.from(AUTH_SOURCE, 'Ui')
    export namespace LoginForm {
      export const SOURCE = common.Action.Source.from(AUTH_SOURCE, 'LoginForm')

      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'submitted': ngrxStore.props<models.Auth.Request>(),

        }
      })
    }
    export namespace Buttons {
      export const SOURCE = common.Action.Source.from(AUTH_SOURCE, 'Buttons')

      export namespace LogOut{
        export const SOURCE = common.Action.Source.from(Buttons.SOURCE, 'LogOut')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.emptyProps(),
            'succeeded': ngrxStore.emptyProps(),
            'failed' : ngrxStore.props<{ errorMessage?: string }>(),
          }
        })
      }

    }

  }

  export namespace Api {
    export const SOURCE = common.Action.Source.from(AUTH_SOURCE, 'Api')
    export const actions = ngrxStore.createActionGroup({
      source: SOURCE,
      events: {
        'started': ngrxStore.props<models.Auth.Request>(),
        'succeeded': ngrxStore.props<{ jwtToken: string }>(),
        'failed': ngrxStore.props<{ errorMessage?: string }>(),
      }
    })
  }


  export namespace Misc {
    export const SOURCE = common.Action.Source.from(AUTH_SOURCE, 'Misc')
    export const actions = ngrxStore.createActionGroup({
      source: SOURCE,
      events: {
        'initialized': ngrxStore.emptyProps(),
        'localAuthStarted': ngrxStore.emptyProps(),
        'localAuthSucceeded': ngrxStore.props<{ jwtToken: string }>(),
        'localAuthFailed': ngrxStore.emptyProps(),
      }
    })
  }
}