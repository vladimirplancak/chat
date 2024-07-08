import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const USER_SOURCE = 'User'

export namespace User {
  // const SOURCE = common.Action.Source.from(USER_SOURCE, 'User123')

  export namespace Api {
    export const SOURCE = common.Action.Source.from(USER_SOURCE, 'Api')
    export namespace List {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'List')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.emptyProps(),
          'succeeded': ngrxStore.props<{ users: readonly models.User[] }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace Get {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Get')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.props<{userId: models.User.Id}>(),
          'succeeded': ngrxStore.props<{ user: models.User | undefined }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace Create {
      // TODO: 
    }
    export namespace Update {
      // TODO:
    }
  }
}