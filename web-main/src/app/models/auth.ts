
import * as jwtDecoder from "jwt-decode"

// TODO: maybe start namespace with Auth.Request, Auth.Self, Auth.Self.from


export namespace Auth {
  export interface Request {
    username: string
    password: string
  }
  export interface Response{
    message: string
    jwtToken: string
  }
  export interface Self {
    userId: string
  }
  export namespace Self {
    /**
       * NOTE: Consider that we will have a JWT token written in local storage
       * from which we can get claims, such as userId, userName, email, roles etc...
       */
    export function from(jwt: string): Self | undefined {
      try {
        return jwtDecoder.jwtDecode<jwtDecoder.JwtPayload & Self>(jwt); 
      } catch(error) {
        console.error('Error decoding JWT token', error)
        return undefined
      }
      
    }
    
  }

  export namespace LocalStorage {
    export namespace Token {
      const KEY = 'Token'
      export function set(value: string): void {
        _localStorageSet(KEY, value)
      }

      export function get(): string | undefined {
        return _localStorageGet(KEY)
      }
    }
  }
}


function _localStorageSet(key: string, value: string): void {
  localStorage.setItem(key, value)
}

function _localStorageGet(key: string): string | undefined {
  return localStorage.getItem(key) ?? undefined
}