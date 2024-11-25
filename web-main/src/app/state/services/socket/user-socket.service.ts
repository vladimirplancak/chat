import * as ngCore from '@angular/core'
import * as service from '../socket/socketIO.service'
import * as rxjs from 'rxjs'
import * as models from '../../../models'
import { Socket } from 'socket.io-client'

@ngCore.Injectable({
  providedIn: 'root',
})
export class UserSocketService {
  private readonly _socketIOService = ngCore.inject(service.SocketIOService)

  public readonly userHasComeOnline$ = new rxjs.Subject<models.User.Id>()
  public readonly userHasGoneOffline$ = new rxjs.Subject<models.User.Id>()

  constructor() {
    // console.log(`UserSocketService initialized.`)
    this.setupSocketListeners()
  }
  //---------------------------------------- AUTHENTICATION HANDLING ---------------------------------------//
  /**
   * Sets the flag `this._isAuthenticated = true` and intializes a socket connection
   * instance in the main socketIOservice.
   */
  public handleUserAuthenticated(): void {
    // console.log('User authenticated. Initializing socket.')
    this._socketIOService.authenticate()
    this.setupSocketListeners()
  }

  /**
  * Sets the flag `this._isAuthenticated = false` and disconnects a socket connection
  * instance in the main socketIOservice.
  */
  public handleUserDeauthenticated(): void {
    // console.log('User logged out. Disconnecting socket.')
    this._socketIOService.deauthenticate()
  }


  //---------------------------------------- LISTENERS ---------------------------------------//
  private setupSocketListeners(): void {
    this._socketIOService.initializeSocketConnection()

    const socket = this._socketIOService.getSocket()

    if (socket) {
      if (socket.connected) {
        // console.log('Socket is already connected. Setting up listeners.')
        this.registerSocketListeners(socket)
      } else {
        // console.log('Socket not connected. Waiting for connection to set up listeners.')
        socket.once('connect', () => {
          // console.log('Socket connected. Setting up listeners.')
          this.registerSocketListeners(socket)
        })
      }
    } else {
      console.error('Socket instance is undefined.')
    }
  }

  private registerSocketListeners(socket: Socket): void {

    socket.on('onlineUsersMapResponse', (onlineUsers: models.User.Id[]) => {
      // console.log('Online users received:', onlineUsers)
      this.markUsersAsOnline(onlineUsers)
    })
    socket.on('userHasComeOnlineResponse', (userId: models.User.Id) => {
      this.userHasComeOnline$.next(userId)
      // console.log(`User came online listener triggered:`, userId)
    })

    socket.on('userHasWentOfflineResponse', (userId: models.User.Id) => {
      this.userHasGoneOffline$.next(userId)
      // console.log(`User went offline listener triggered:`, userId)
    })
  }

  //---------------------------------------- EMITTERS ---------------------------------------//
  /**
   * Emit `requestOnlineUsers` to fetch the list of online users from the back end.
   */
  public requestOnlineUsersMap(userId: models.User.Id): void {
    this._socketIOService.initializeSocketConnection()

    const socket = this._socketIOService.getSocket()
    if (socket) {
      if (socket.connected) {
        socket.emit('onlineUsersMapRequest', userId)
        // console.log('Online users request emitted.')
      } else {
        console.log('Socket not connected. Waiting for connection to emit request.')
        socket.once('connect', () => {
          socket.emit('onlineUsersMapRequest',userId)
          // console.log('Online users request emitted after connection.')
        })
      }
    } else {
      console.error('Socket instance is undefined. Cannot request online users.')
    }
  }
  /**
   *  Emit `userHasComeOnlineRequest` to the back end 
   *  for the purposes of notifying online users of this event.
   */
  public userHasComeOnlineRequest(userId: models.User.Id): void {
    this._socketIOService.initializeSocketConnection()

    const socket = this._socketIOService.getSocket()
    if (socket) {
      if (socket.connected) {
        socket.emit('userHasComeOnlineRequest', userId)
        // console.log(`User has come online request emitted:`, userId)
      } else {
        console.log('Socket not connected. Waiting for connection to emit online request.')
        socket.once('connect', () => {
          socket.emit('userHasComeOnlineRequest', userId)
          // console.log(`User has come online request emitted after connection:`, userId)
        })
      }
    } else {
      console.error('Socket instance is undefined. Cannot emit user online request.')
    }
  }
  /**
   *  Emit `userHasWentOfflineRequest` to the back end 
   *  for the purposes of notifying online users of this event.
   */
  public userHasWentOfflineRequest(userId: models.User.Id): void {
    this._socketIOService.initializeSocketConnection()

    const socket = this._socketIOService.getSocket()
    if (socket) {
      if (socket.connected) {
        socket.emit('userHasWentOfflineRequest', userId)
        // console.log(`User has went offline request emitted:`, userId)
      } else {
        console.log('Socket not connected. Waiting for connection to emit offline request.')
        socket.once('connect', () => {
          socket.emit('userHasWentOfflineRequest', userId)
          // console.log(`User has went offline request emitted after connection:`, userId)
        })
      }
    } else {
      console.error('Socket instance is undefined. Cannot emit user offline request.')
    }
  }
 //---------------------------------------- MISC ---------------------------------------//
  /**
   * Updates the local state by marking each user in the provided list as online.
   * This function processes the list of online user IDs, retrieved from the backend,
   * and pushes each userID into the **userHasComeOnline$** subject, effectively making it
   * come appear as online to the client that had just logged in or has refreshed the page.
   * 
   * @param onlineUsers - An array of user IDs representing users who are currently online,
   * retrieved from the backend.
   * Each user ID in this list will be pushed to the subject updating the local state of
   * the client.
   */
  public markUsersAsOnline(onlineUsers: models.User.Id[]): void {
    // console.log('Pre-existing online users received:', onlineUsers)
    onlineUsers.forEach((userId) => {
        if (userId) {
            this.userHasComeOnline$.next(userId)  
            // console.log(`User ${userId} marked as online locally.`)
        } else {
            console.warn('Invalid user ID in online users list:', userId)
        }
    })
}
}
