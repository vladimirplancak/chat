// models/Message.ts
export namespace Messages{

  export interface FrontendMessage {
    conId: string       // Corresponds to conversationId in database
    content: string     // Corresponds to messageBody in database
    dateTime: string    // ISO string from frontend, might need conversion to Date
    userId: string
    isSeen?: number
  }

  export interface Message {
    id: string // uniqueidentifier in SQL corresponds to string in TypeScript
    conversationId: string // uniqueidentifier in SQL corresponds to string in TypeScript
    userId: string // uniqueidentifier in SQL corresponds to string in TypeScript
    messageBody: string // nvarchar(max) in SQL corresponds to string in TypeScript
    dateTime: Date // datetime in SQL corresponds to Date in TypeScript (optional)
    isSeen?: number
  }
  export type id = string | string[]
}

  