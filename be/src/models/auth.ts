// models/UserAuth.ts

export interface UserAuth {
    userId: string
    username: string
    password: string
  }

export namespace Auth {
  export type registerInfo = Omit<UserAuth,'userId'>
}
  