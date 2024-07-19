/**
 * Basic building block of user
 */
export interface User {
  id: User.Id
  name: string
}
export namespace User {
  
  export type Id = string

  export type Input = Omit<User, 'id'>
  
  export type Update = Partial<Input>
}
