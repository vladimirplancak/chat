import { User } from './user'

/**
 * Basic building block of Conversation
 */
export interface Conversation {
 id: Conversation.Id
 /**
  * Usually, in most of the cases, the name of the conversation will be defined,
  * however in case that we load conversation messages before the conversation
  * itself, we will not have the name of the conversation, however we will be
  * able to selvage the conversation id, participant ids and messages.
  */
 name?: string
 participantIds?: User.Id[]
 creatorId: User.Id
}
export namespace Conversation {
    export type Id = string
    export type Input = Omit<Conversation, 'id'>
    export interface Update extends Partial<Omit<Input, 'participantIds'>> {
      participantIdsToRemove?: User.Id[]
      participantIdsToAdd?: User.Id[]
    }

    export type MessageWithConversation = {
      conversationId: Id,
      message: Message
    }

    export interface Message {
      id: Message.Id
      userId: User.Id
      content: string
      dateTime: Date
      isSeen: number
    }
    export namespace Message {
      export type Id = string
      export type Input = Omit<Message, 'id'>
      export type Update = Pick<Message, 'content'>
      
      export interface SeenMessagesInConResponse{
        seenMessageIds: Message.Id[]
        conversationId: Conversation.Id
      }
      export interface InContext extends Message{
        conId: Conversation.Id
      }
      export namespace InContext {
        export type Input = Omit<InContext, 'id'>
      }
    }

    /**
     * An extended version of {@link Conversation} that includes the list of
     * {@link Messages}.
     */
    export interface WithMessages extends Conversation { 
      messages: readonly Message[]
    }
}