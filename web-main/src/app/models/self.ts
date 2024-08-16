// TODO: maybe start namespace with Auth.Request, Auth.Self, Auth.Self.from


export namespace Auth {
    export interface Request {
      username: string
      password: string
    }
  
  export interface Self {
    id: string
    userName: string
  }
  export namespace Self {
  
    /**
       * NOTE: Consider that we will have a JWT token written in local storage
       * from which we can get claims, such as id, userName, email, roles etc...
       */
    export function from(jwt: string): Self | undefined {
      // TODO: decode jwt token
      return {
        id: '1',
        userName: 'lemon',
      }
    }
  }
}


