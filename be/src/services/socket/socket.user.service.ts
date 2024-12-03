import * as socketIO from 'socket.io'
import * as db from '../../config/db'
import * as models from '../../models'
import * as services from './socket.auth.service'
import * as rxjs from 'rxjs'

export class SocketUserService {
    private _ioServer: socketIO.Server
    private _authService: services.SocketAuthService
    private _socketClosedCleanUp$ = new rxjs.Subject<void>()

    constructor(ioServer: socketIO.Server, authService: services.SocketAuthService) {
        this._ioServer = ioServer
        this._authService = authService
    }

    //----------------------------------- NOTIFIER METHODS ---------------------------------------//

    notifyClientOfOnlineUsersMap( userId: models.User.id, onlineUsers: string[]) {
        const foundClientSocket = this._authService.getSocketIdByUserId(userId)
        if (!foundClientSocket) {
            console.warn(`Socket not found for user ${userId}. Cannot send online users map.`)
            return
        }
        this._ioServer.to(foundClientSocket).emit('onlineUsersMapResponse', onlineUsers)
    }
    
    // This method will register the events to the socket.
    public registerUserEvents(socket: socketIO.Socket): void {

        socket.on('onlineUsersMapRequest', (userId: models.User.id) => {
            try {
                if (!userId) throw new Error('Invalid userId received for onlineUsersMapRequest')
                const onlineUsers = this._authService.getOnlineUsers()
                this.notifyClientOfOnlineUsersMap(userId, onlineUsers )
            } catch (error) {
                console.error(`Error in onlineUsersMapRequest handler: ${error}`)
            }
        })
         //----------------------------------- EMITTER METHODS ---------------------------------------//
         
        //NOTE: This subject emits as many socket events as there are currently connected users (sockets)
        //TODO: Implement a system that maps each connection socket to a different subject something along
        //the lines of private userSubjects: Map<string, Subject<string>>(userId, Subject<string>). This way
        //every user would have his own Subject emission and there would be no need for a shared one using foreach.
        this._authService.userConnected$.pipe(
            rxjs.first(),
            rxjs.takeUntil(this._socketClosedCleanUp$),
            rxjs.tap((userId) => {
                // console.log(`Reactively handling connection of user: ${userId}`)
                this._authService.clientConnectionSocketIdMap.forEach((socketId) => {
                    // console.log(`Reactively sending response for socket: ${userId}/${socketId}`)
                    this._ioServer.to(socketId).emit('userHasComeOnlineResponse', userId)
                })
            })
        ).subscribe()

        this._authService.userDisconnected$.pipe(
            rxjs.takeUntil(this._socketClosedCleanUp$),
            rxjs.tap((userId) => {
                // console.log(`Reactively handling disconnection of user: ${userId}`)
                this._authService.clientConnectionSocketIdMap.forEach((socketId) => {
                    this._ioServer.to(socketId).emit('userHasWentOfflineResponse', userId)
                })
            })
        ).subscribe()



        socket.on('disconnect', () => {
            this._socketClosedCleanUp$.next();
            this._socketClosedCleanUp$.complete();
        });
    }


}
