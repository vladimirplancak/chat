import { User } from './user'

export namespace Conversation {
  /** Core Conversation structure of the back end which represents a mirror image 
   * of the properties found in a corresponding sql table. */
  export interface Base {
    id: Id
    name?: string
    creatorId: User.Id
    participantIds?: User.Id[]
    createdAt?: Date 
  }

  export type Id = string
  export type Input = Omit<Base, 'id' | 'createdAt'> & { participantIds?: User.Id[] }



  export interface Update extends Partial<Omit<Input, 'participantIds'>> {
    participantIdsToRemove?: User.Id[]
    participantIdsToAdd?: User.Id[]
  }

  export interface Message {
    id: Message.Id
    userId: User.Id
    content: string
    dateTime: Date
    isSeen?: number
  }

  export namespace Message {
    export type Id = string
    export type Input = Omit<Message, 'id'>
    export type Update = Pick<Message, 'content'>

    export interface SeenPrivateMsgsResponse {
      seenMessageIds: Message.Id[]
      conversationId: Conversation.Id
    }

    export interface SeenPublicMsgsResponse {
      [messageId: Message.Id]: User.Id[]
    }

    export interface InContext extends Message {
      conId: Conversation.Id
    }

    export namespace InContext {
      export type Input = Omit<InContext, 'id'>
    }
  }

    //conversation with messages included
    export interface WithMessages extends Base {
      messages: readonly Message[]
    }
  

  //types for UI  backend responses
  export type conParticipantsClickedStatusResponse = {
    participantId: User.Id
    hasCurrentlyClickedConId: Conversation.Id
    status: boolean
  }

  export type PubConClickedStatusResponse = {
    currentlyClickedPubCon: Conversation.Id
    participantIdsClickedStatus: User.Id[]
  }

  export type MessageWithConversation = {
    conversationId: Id
    message: Message
  }


  // Backend-Specific Types
  export namespace Backend {
    export interface ConWithParticipants extends Base {
      participantIdsToAdd?: User.Id[] 
      participantIdsToRemove?: User.Id[] 
    }
    export interface UserConversation {
      userId: User.Id 
      conversationId: Conversation.Id
    }
  }

  // Frontend-Specific Types
  export namespace Frontend {
    export interface Update extends Partial<Omit<Input, 'participantIds'>> {
      participantIdsToAdd?: User.Id[]
      participantIdsToRemove?: User.Id[]
    }
  }
}
