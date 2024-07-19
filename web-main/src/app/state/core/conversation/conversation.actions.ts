import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const CON_SOURCE = 'Con'

export namespace Conversation {
  export namespace Ui {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Ui')
    export namespace Root {
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'Root')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'initialized': ngrxStore.emptyProps(),
        }
      })
    }
  }


export namespace Api {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Api')
    
    export namespace List {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'List')

        export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
                'started': ngrxStore.emptyProps(),
                'succeeded': ngrxStore.props<{ conversations : readonly models.Conversation[] }>(),
                'failed': ngrxStore.props<{errorMessage?: string}>(),
            }
        })
    }

    export namespace Get {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Get')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{conversationId: models.Conversation.Id}>(),
            'succeeded': ngrxStore.props<{ conversation: models.Conversation | undefined }>(),
            'failed': ngrxStore.props<{errorMessage?: string}>(),
          }
        })
      }
    
    export namespace Create {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Create')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{input: models.Conversation.Input}>(),
            'succeeded': ngrxStore.props<{ conversation: models.Conversation }>(),
            'failed': ngrxStore.props<{errorMessage?: string}>(),
          }
        })
      }
    
    export namespace Update {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Update')
        export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
                'started': ngrxStore.props<{ id: models.Conversation.Id; updates: models.Conversation.Update }>(),
                'succeeded': ngrxStore.props<{ conversation: models.Conversation }>(),
                'failed': ngrxStore.props<{ errorMessage?: string }>(),
            }
        })
    }

    export namespace Delete {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Delete')
        export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
                'started': ngrxStore.props<{ id: models.Conversation.Id }>(),
                'succeeded': ngrxStore.props<{ conversation: models.Conversation }>(),
                'failed': ngrxStore.props<{ errorMessage?: string }>(),
            }
        })
    }

}

}