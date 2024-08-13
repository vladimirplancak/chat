import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const USER_SOURCE = 'User'

export namespace User {
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
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Create')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.props<{input: models.User.Input}>(),
          'succeeded': ngrxStore.props<{ user: models.User }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace Update {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Update')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.props<{id: models.User.Id; updates: models.User.Update}>(),
          'succeeded': ngrxStore.props<{ user: models.User }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace Delete {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Delete')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.props<{id: models.User.Id }>(),
          'succeeded': ngrxStore.props<{ user: models.User }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace ListOnlineIds {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'ListOnlineIds')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'started': ngrxStore.emptyProps(),
          'succeeded': ngrxStore.props<{ onlineUserIds: Set<models.User.Id> }>(),
          'failed': ngrxStore.props<{errorMessage?: string}>(),
        }
      })
    }
    export namespace Subscriptions {
      export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Subscriptions')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'hasComeOnline': ngrxStore.props<{ userId: models.User.Id }>(),
          'hasWentOffline': ngrxStore.props<{ userId: models.User.Id }>(),
        }
      })
    }
  }
}