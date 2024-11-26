import * as jwtDecoder from "jwt-decode"

// TODO: maybe start namespace with Auth.Request, Auth.Self, Auth.Self.from


export namespace Auth {
  export interface Request {
    username: string
    password: string
  }
  export interface Response{
    message: string
    accessToken: string
    refreshToken: string 
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
    export namespace Tokens {
      const ACCESS_TOKEN_KEY = 'access_token'
      const REFRESH_TOKEN_KEY = 'refresh_token'
      
      export function set(value: Response): void {
     
        _localStorageSet(ACCESS_TOKEN_KEY, value.accessToken)
        _localStorageSet(REFRESH_TOKEN_KEY, value.refreshToken)
      }

      export function getAccessToken(): string | undefined {
        return _localStorageGet(ACCESS_TOKEN_KEY)
      }
      export function getRefreshToken(): string | undefined {
        return _localStorageGet(REFRESH_TOKEN_KEY)
      }

      export function TokenExpDate(){
        const Token = getAccessToken()
        if(!Token){
          throw new Error('Token undefined.')
        }
        // console.log(`Token expiry date:`,jwtDecoder.jwtDecode<jwtDecoder.JwtPayload>(Token)?.exp )
       return (jwtDecoder.jwtDecode<jwtDecoder.JwtPayload>(Token)?.exp || 0) * 1000; // Convert to milliseconds
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

