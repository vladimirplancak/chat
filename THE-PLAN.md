1.1. (18.06.2024)
  - Set up the development environment (Node.js, Angular CLI, code editor).
  - Discuss project goals, requirements, and the three main domain concepts: Channels, Users, Messages.
  - Create a new Angular project.
  - Integrate Angular Material into the project.
  - Basic introduction to Angular structure and component-based architecture.

- Defining project Domain classes
```ts
  interface Channel {
    id: string
    ownerId: string
    participantIds: string[]
  }

  interface Message {
    channelId: string
    userId: string
    content: string
    date: Date
  }

  interface User {
    id: string
    name: string
  }
```

1.2. (21.06.2024)
- Set up Git for version control.
- Create initial commits and push the project to a remote repository (e.g., GitHub). (feature branches etc...)
- Create the basic folder structure (e.g., components, services, models, state management).


"STANDARD GIT FLOW"
root/main (production)
root/develop (QA)
root/feature/feature-name

"Discover-ability"


2.1 (25.06.2024)
- Set up Angular routing for navigating between Channels, Users, and Messages.
- Create placeholder components for Channels, Users, and Messages.
- Implement navigation links and test routing.

2.2 (27.06.2024)
Integrate Angular Material components (e.g., toolbar, sidenav, lists).
Design a basic layout with a toolbar and a side navigation.
Create a responsive layout for the main components (Channels, Users, Messages).

3.1 (02.07.2024)
- review
- ngrx concepts (store, actions, reducers, effects)
- command vs event
- declarative vs imperative

const rootStore = {
  'users': {
    selectedUser: null,
    users: [],
  }
  'feature-2': {}
  'feature-3': {}
}


STATE {firstName: limun, lastName: plancak} -> "selector" -> {fullName: "limun Plancak"}

Users{

  export namepsace Ui {
    ForTable
    ForSingleSelect
  }
}

Good example for an action 

[Source] Action
[Source.SubSource1.SubSource2] clicked | changed | hovered | selected | unselected | opened 

Bad example for an action
[Source.SubSource1.SubSource2] open | do that | do this 

"event driven application"

{
  selectedConversationId: string | undefined
}

SELECTED_CONVERSATION: Conversation | undefined = createSelector(STATE, SELECTED_CONVERSATION_ID (state, selectedConversationId) => {
  return state.conversations[selectedConversationId]
})


SELECTED_CONVERSATION_LOADING -> !SELECTED_CONVERSATION && !CONVERSION_LOADING_ERROR[selectedConversionId]


@if(conversation !== undefined) {
  // show conversation
} else if (conversationLoading) {
  // show loader 
} else {
  // show error conversation failed to load
}


3.1 (08.07.2024)


import * as state from './state'

state.common.Action.create()

3.2 (16.07.2024)

4.1 (24.07.2024)
- ngCore.effect -> ?
  private readonly _signal1 = ngCore.signal(1)

  setTimeout(() => {
    this._signal1.update(2)
  }, 2000)


  effect(() => {
    const lastValue1 = this.signal1() // 1 -> 2
    const lastValue2 = this.signal2() // 1 
    const lastValue3 = this.signal3() // 1 -> 3

    if() ... {
      doSomethingService()
    }

    // NOTE: This is strictly forbidden
    // COMPLETELY ANTI-PATTERN

    this._signal4.update(3)
    
  }, {allowSignalUpdates: true})

- rxjs-interop -> toSignal toObservable
-> signal === function doJob() { ..doing job } 
-> doJob()
-> signal()


-> const subject$ = rxjs.Subject()
-> const signal = toSignal(subject$) // will throw an run time error
-> const signal = toSignal(subject$, {initialValue: undefined}) // this is fine

- cleanup switching mechanism for conversations
 -> this._router.navigate([])
 -> this._router.dispatch(init({params: {selectionId}}))
 -> after further investigation, I've realized that ngrx actually supports what we need, but it is really complicated how to implement it, and might cause more issues then benefit, so we wont implement it
- user for con
