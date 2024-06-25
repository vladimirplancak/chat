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

