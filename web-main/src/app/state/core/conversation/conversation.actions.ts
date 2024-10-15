import * as common from '../../common'
import type * as user from '../user'
import * as ngrxStore from '@ngrx/store'
import * as models from '../../../models'

export const CON_SOURCE = 'Con'

export namespace Con {
  export namespace Ui {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Ui')

    export namespace UserSelectorDialog {
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'UserSelectorDialog')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events:{
          'selected': ngrxStore.props<{userId: models.User.Id}>()
        }
      })
    }

    export namespace ParticipantSelectorDialog{
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'ParticipantSelectorDialog')

      export namespace Backdrop {
        export const SOURCE = common.Action.Source.from(ParticipantSelectorDialog.SOURCE, 'Backdrop')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'clicked': ngrxStore.emptyProps(),
          }
        })
      }

      export namespace Item {
        export const SOURCE = common.Action.Source.from(ParticipantSelectorDialog.SOURCE, 'Item')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'clicked': ngrxStore.props<{ userId: models.User.Id }>(),
          }
        })
      }

      export namespace Buttons { 
        export const SOURCE = common.Action.Source.from(ParticipantSelectorDialog.SOURCE, 'Buttons')
        export namespace Save {
          export const SOURCE = common.Action.Source.from(Buttons.SOURCE, 'Save')
          export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
              'clicked': ngrxStore.emptyProps(),
            }
          })
        } 
      }

      
    }

    export namespace UpdateParticipantList {
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'UpdateParticipantList')
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE, 
        events:{
          'started':  ngrxStore.props<{conversationId:models.Conversation.Id, newlySelectedParticipantIds: models.User.Id[]}>(),
          //'succeeded': ngrxStore.emptyProps(),
        }
      })
    }
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

      export namespace Buttons {
        export const SOURCE = common.Action.Source.from(List.SOURCE, 'Buttons')

        export namespace Add {
          export const SOURCE = common.Action.Source.from(Buttons.SOURCE, 'Add')
          export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
              'clicked': ngrxStore.emptyProps(),
            }
          })
        }
      }
    }

    export namespace MessageSender {
      export const SOURCE = common.Action.Source.from(Ui.SOURCE, 'MessageSender')
      export namespace TextArea {
        export const SOURCE = common.Action.Source.from(MessageSender.SOURCE, 'TextArea')
        export namespace Input {
          export const SOURCE = common.Action.Source.from(TextArea.SOURCE, 'Input')
          export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
              'changed': ngrxStore.props<{ conversationId: models.Conversation.Id, messageText: string }>(),
            }
          })
        }
      }
      export namespace Buttons {
        export const SOURCE = common.Action.Source.from(MessageSender.SOURCE, 'Buttons')
        export namespace Send { 
          export const SOURCE = common.Action.Source.from(Buttons.SOURCE, 'Send')
          export const actions = ngrxStore.createActionGroup({
            source: SOURCE,
            events: {
              'clicked': ngrxStore.emptyProps(),
            }
          })
        }
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

      export namespace Subscriptions {
        export const SOURCE = common.Action.Source.from(Api.SOURCE, 'Subscriptions')
        /**
         * TODO: Should be one action actually, only, when we receive a message.
         */
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'messageReceived': ngrxStore.props<{ message: models.Conversation.Message.InContext}>(),
          }
        })
      }

      export namespace Send {
        export const SOURCE = common.Action.Source.from(Message.SOURCE, 'Send')
        export const actions = ngrxStore.createActionGroup({
          source: SOURCE,
          events: {
            'started': ngrxStore.props<{ payloadMessage: models.Conversation.Message.InContext.Input }>(),
            'succeeded':ngrxStore.props<{ conversationId: models.Conversation.Id}>(),
            'failed': ngrxStore.props<{ errorMessage?: string }>(),
          }
        })
      }
    }
  }

  export namespace Misc {
    export const SOURCE = common.Action.Source.from(CON_SOURCE, 'Misc');
  
    export namespace Selection {
      export const SOURCE = common.Action.Source.from(Misc.SOURCE, 'Selection');
      export const actions = ngrxStore.createActionGroup({
        source: SOURCE,
        events: {
          'requested': ngrxStore.props<{directConId: models.Conversation.Id}>(),
        }
      });
    }
  }
}