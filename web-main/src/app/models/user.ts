/**
 * Basic building block of user
 */
export interface User {
  id: User.Id
}
export namespace User {
  export type Id = string
}