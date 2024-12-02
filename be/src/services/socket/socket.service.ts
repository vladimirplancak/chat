// socket.service.ts
import * as socketIO from 'socket.io'
import * as services from '../../services'

export const setupSocketEvents = (io: socketIO.Server) => {
  const authService = new services.socket.SocketAuthService()
  const apiMessageService = new services.api.ApiMessageService()
  io.on('connection', (socket) => {
    // console.log('A user connected:', socket.id)

    // Instantiate services with authService as a shared dependency
    const messageService = new services.socket.SocketMessageService(io,apiMessageService,authService)
    const conService = new services.socket.SocketConService(io, authService)
    const userService = new services.socket.SocketUserService(io, authService)

    // Register socket events for authentication and messaging
    authService.registerAuthEvents(socket)
    messageService.registerMessageEvents(socket)
    conService.registerConversationEvents(socket)
    userService.registerUserEvents(socket)
  });
};
