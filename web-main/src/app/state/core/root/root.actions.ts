import * as common from '../../common'
import * as ngrxStore from '@ngrx/store'

export const ROOT_SOURCE = 'Root'

export namespace Root {
  export namespace Ui {
    export const SOURCE = common.Action.Source.from(ROOT_SOURCE, 'Ui')
    export const actions = ngrxStore.createActionGroup({
      source: SOURCE,
      events: {
        'initialized': ngrxStore.emptyProps(),
      }
    })
  }
}