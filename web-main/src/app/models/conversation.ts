import { User } from './user'

/**
 * Basic building block of Conversation
 */
export interface Conversation {
 id: Conversation.Id
 name: string
 participantIds: readonly User.Id[]
}
export namespace Conversation {
    export type Id = string
    export type Input = Omit<Conversation, 'id'>
    export type Update = Partial<Input>

    export interface Message {
      id: Message.Id
      userId: User.Id
      content: string
      datetime: Date
    }
    export namespace Message {
      export type Id = string
      export type Input = Omit<Message, 'id'>
      export type Update = Pick<Message, 'content'>
    }

    /**
     * An extended version of {@link Conversation} that includes the list of
     * {@link Messages}.
     */
    export interface WithMessages extends Conversation { 
      messages: readonly Message[]
    }
}