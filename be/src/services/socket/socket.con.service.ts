// socket.con.service.ts
import * as socketIO from 'socket.io'
import * as models from '../../models'
import * as services from './socket.auth.service'
import * as utils from '../../utilities/conversation-utils'

export class SocketConService {
  private _ioServer: socketIO.Server
  private _authService: services.SocketAuthService
  
  

  constructor(ioServer: socketIO.Server, authService: services.SocketAuthService) {
    this._ioServer = ioServer
    this._authService = authService
    

  }


  //----------------------------------- NOTIFIER METHODS ---------------------------------------//
  public async notifyParticipantsOfPrivateConClickedStatus(userId: models.User.id, clickedConId: models.Conversation.id) {

    const clientCurrentConvIdClickedMap = this._authService.clientCurrentConvIdClickedMap
    // Get the previous conversation this user had clicked (if any)
    const previousConId = clientCurrentConvIdClickedMap.get(userId)
    // Update the map with the user's clicked conversation
    clientCurrentConvIdClickedMap.set(userId, clickedConId)
    // Get all participants of the current conversation
    const conParticipants = await utils.getUserIdsByConversationId(clickedConId)
    // check if all participants have clicked on the same conversation
    const allParticipantsClicked = conParticipants.every(participantId =>
      clientCurrentConvIdClickedMap.get(participantId) === clickedConId
    )

    if (allParticipantsClicked) {
      console.log(`Both participants have the conversation open. Sending notifications...`)

      // Notify all participants
      conParticipants.forEach(participantId => {
        const participantSocketId = this._authService.getSocketIdByUserId(participantId)
        const notSelfParticipantId = conParticipants.filter(userId => userId !== participantId)
        if (participantSocketId) {
          // Emit to self that the other participant has clicked on the private conversation
          this._ioServer
            .to(participantSocketId)
            .emit(
              'selfClickedConIdResponse',
              `User ${notSelfParticipantId} has clicked on the conversation...`
            )
        }
      })
    }
    // a case when either of the participants switches from their mutual conversation
    else if (previousConId && previousConId !== clickedConId) {
      console.log(
        `User ${userId} switched from conversation ${previousConId} to ${clickedConId}.`
      )

      // Notify the participants of the previous conversation about the switch
      const previousConParticipants = await utils.getUserIdsByConversationId(previousConId)
      previousConParticipants.forEach(participantId => {
        if (participantId !== userId) {
          const participantSocketId = this._authService.getSocketIdByUserId(participantId)
          if (participantSocketId) {
            this._ioServer
              .to(participantSocketId)
              .emit(
                'selfClickedConIdResponse',
                `User ${userId} has switched to a different conversation.`
              )
          }
        }
      })
    }
    else {
      console.log(`Not all participants have clicked on the conversation yet.`)
      const notSelf = conParticipants.filter(participantId => participantId !== userId)
      const participantSocketId = this._authService.getSocketIdByUserId(userId)
      if (notSelf && participantSocketId) {
        // Emit to self that the other participant has not yet clicked on private conversation
        this._ioServer
          .to(participantSocketId)
          .emit(
            'selfClickedConIdResponse',
            `User ${notSelf} has NOT clicked on the conversation yet...`
          )
      }
    }
  }




  /**This method handles the notification of addition of participants to the conversation */
  public async notifyParticipantsOfAddion(conId: string) {
    try {
      const currentConParticipants = await utils.getUserIdsByConversationId(conId)
      const conversationName = await utils.getConversationNameByConId(conId)

      //notify all current participants of the addition
      //including the added one/s
      currentConParticipants.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId)
          .emit('conParticipantListUpdatedResponse', 
            { conId, name: conversationName, 
              participantIds: currentConParticipants 
            })
        }
      })
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }
  /**This method handles the notification of removal of the participants from the conversation */
  public async notifyParticipantsOfRemoval(conId: string, participantIds: models.Conversation.ConWithParticipants) {
    try {
      const removedParticipantId = participantIds?.participantIdsToRemove
      const currentConParticipants = await utils.getUserIdsByConversationId(conId)

      //notify the client that he has been removed from the conversation
      removedParticipantId?.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('conParticipantRemovedResponse', conId)
        }
      })

      //notify the remaining participants in that conversation of that removal
      currentConParticipants?.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId)
          .emit('conParticipantListUpdatedResponse', { conId, participantIds: currentConParticipants })
        }
      })
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }
  /**This method handles the notification of updating the client about being added to a new conversation */
  public async notifyAddedClientOfNewConversation(
    con: models.Conversation.ConWithParticipants,
    addedParticipantsId: models.User.id[]
  ) {
    try {
      const addedParticipantSocketId = this._authService.getSocketIdByUserId(addedParticipantsId[1])
      const conWithParticipants: models.Conversation.ConWithParticipants = {
        id: con.id,
        name: con.name,
        createdAt: con.createdAt,
        participantIds: [...addedParticipantsId],
        creatorId: ''
      }
      //notify added participant of private conversation creation
      if (addedParticipantSocketId) {
        this._ioServer.to(addedParticipantSocketId)
        .emit('privateConversationCreatedResponse', conWithParticipants)
      }
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }

  public async notifyClientsOfDeletedConversation(deletedConversation: models.Conversation.ConWithParticipants) {
    try {

      const participantIdsToNotify = deletedConversation.participantIds
      participantIdsToNotify.forEach(participantId => {
        const participantSocketId = this._authService.getSocketIdByUserId(participantId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('deleteCoversationResponse', deletedConversation)
        }
      })
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }

  //----------------------------------- LISTENER METHODS ---------------------------------------//

  public registerConversationEvents(socket: socketIO.Socket): void {
    /**
     * This request method determines whether we will notify the client of addition
     * or removal of participants in a given conversation.
     */
    socket.on('updateConParticipantListRequest', (conId: string, participantIds: models.Conversation.ConWithParticipants) => {
      if (participantIds.participantIdsToAdd) {
        this.notifyParticipantsOfAddion(conId)
      } else {
        this.notifyParticipantsOfRemoval(conId, participantIds)
      }
    })
    /**
     * This request method simply forwards the payload to the notifier method.
     */
    socket.on('updateParticipantOfPrivateConCreationRequest',
      (
        con: models.Conversation.ConWithParticipants,
        addedParticipantsId: models.User.id[]
      ) => {
        this.notifyAddedClientOfNewConversation(con, addedParticipantsId)
      })
    /**
      * This request method forwards the payload to the notifier method
      */
    socket.on('deleteCoversationRequest', (deletedConversation: models.Conversation.ConWithParticipants) => {
      this.notifyClientsOfDeletedConversation(deletedConversation)
    })

    socket.on('selfClickedConIdRequest', (userId: models.User.id, clickedConId:models.Conversation.id)=>{
      this.notifyParticipantsOfPrivateConClickedStatus(userId, clickedConId)
    })
  }


}
