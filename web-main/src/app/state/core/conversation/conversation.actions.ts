import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const CON_SOURCE = 'Con'

export namespace Con {
  export namespace Ui {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Ui')
    export namespace List {
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'ConList')
      export namespace ConItem {
        export const SOURCE = common.Action.Source.from(List.SOURCE, 'ConItem')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'clicked': ngrxStore.props<{ selectedId: models.Conversation.Id }>(),
          }
        })
      }
    }
  }
  export namespace Api {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Api')

    export namespace Con {
      export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Con')

      export namespace List {
        export const SOURCE = common.Action.Source.from(Con.SOURCE, 'List')

        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.emptyProps(),
            'succeeded': ngrxStore.props<{ conversations: readonly models.Conversation[] }>(),
            'failed': ngrxStore.props<{ errorMessage?: string }>(),
          }
        })
      }

      export namespace Get {
        export const SOURCE = common.Action.Source.from(Con.SOURCE, 'Get')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{ conversationId: models.Conversation.Id }>(),
            'succeeded': ngrxStore.props<{ conversation: models.Conversation | undefined }>(),
            'failed': ngrxStore.props<{ errorMessage?: string }>(),
          }
        })
      }

      export namespace Create {
        export const SOURCE = common.Action.Source.from(Con.SOURCE, 'Create')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{ input: models.Conversation.Input }>(),
            'succeeded': ngrxStore.props<{ conversation: models.Conversation }>(),
            'failed': ngrxStore.props<{ errorMessage?: string }>(),
          }
        })
      }

      export namespace Update {
        export const SOURCE = common.Action.Source.from(Con.SOURCE, 'Update')
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
        export const SOURCE = common.Action.Source.from(Con.SOURCE, 'Delete')
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

    export namespace Message {
      export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Message')

      export namespace List {
        export const SOURCE = common.Action.Source.from(Message.SOURCE, 'List')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{ conversationId: models.Conversation.Id }>(),
            'succeeded': ngrxStore.props<{ conversationId: models.Conversation.Id, messages: readonly models.Conversation.Message[] }>(),
            'failed': ngrxStore.props<{ conversationId: models.Conversation.Id, errorMessage?: string }>(),
          }
        })
      }
    }

  }

}