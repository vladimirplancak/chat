import { User } from './user'

/**
 * Basic building block of chanel
 */
export interface Conversation {
 id: Conversation.Id
 name: string
 participantIds: readonly User.Id[]
}
export namespace Conversation{
    export type Id = string
    export type Input = Omit<Conversation, 'id'>
    export type Update = Partial<Input>
}