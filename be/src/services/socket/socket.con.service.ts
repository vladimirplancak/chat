// socket.con.service.ts
import * as socketIO from 'socket.io'
import * as models from '../../models'
import * as services from './socket.auth.service'
import * as conUtils from '../../utilities/conversation-utils'

export class SocketConService {
  private _ioServer: socketIO.Server
  private _authService: services.SocketAuthService
  
  

  constructor(ioServer: socketIO.Server, authService: services.SocketAuthService) {
    this._ioServer = ioServer
    this._authService = authService
    

  }

  //----------------------------------- NOTIFIER METHODS ---------------------------------------//
  public async notifyParticipantsOfPrivateConClickedStatus(userId: models.User.id, clickedConId: models.Conversation.id) {
    try {
      const clientCurrentConvIdClickedMap = this._authService.clientCurrentConvIdClickedMap
      // Get the previous conversation this user had clicked (if any)
      const previousConId = clientCurrentConvIdClickedMap.get(userId)
      // Update the map with the user's clicked conversation
      clientCurrentConvIdClickedMap.set(userId, clickedConId)
      // Get all participants of the current conversation
      const conParticipants = await conUtils.API.getUserIdsByConversationId(clickedConId)
      // check if both participants have clicked on the same conversation
      const haveBothParticipantsClickedSameCon = conParticipants.every(participantId =>
        clientCurrentConvIdClickedMap.get(participantId) === clickedConId
      )

      // case 1: notify both participants(self, notself) that they have clicked the same con
      if (haveBothParticipantsClickedSameCon) {
        this.notifyParticipantsOfSameCon(conParticipants, clickedConId)

        // case 1.1: notify the previous conversation notself participant of self clicking another conv
        if (previousConId && previousConId !== clickedConId) {
          this.notifyNotSelfParticipantOfPreviousCon(previousConId, userId, clickedConId)
        }
      }
      // case 2: notify previous conversation's notself of self clicking away from current conv
      else if (previousConId && previousConId !== clickedConId) {
        this.notifyNotSelfParticipantOfPreviousCon(previousConId, userId, clickedConId)

        // case 3: notify self that notself has not yet clicked on the con
      } else {
        this.notifySelfOfUnclickedCon(userId, conParticipants, clickedConId)
      }
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }

  }

  /**This method handles the notification of addition of participants to the conversation */
  public async notifyParticipantsOfAddion(conId: string) {
    try {
      const currentConParticipants = await conUtils.API.getUserIdsByConversationId(conId)
      const conversationName = await conUtils.API.getConversationNameByConId(conId)

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
      const currentConParticipants = await conUtils.API.getUserIdsByConversationId(conId)

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

//----------------------------------- HELPER METHODS ---------------------------------------//
//TODO: maybe move these helper methods into conversation-utils.ts ????
  private emitNotification(socketId: string, name: string, payload: any) {
    this._ioServer.to(socketId).emit(name, payload);
  }

  private async notifyParticipantsOfSameCon(
    conParticipants: models.User.id[],
    clickedConId: models.Conversation.id
  ) {
    conParticipants.forEach(participantId => {
      const participantSocketId = this._authService.getSocketIdByUserId(participantId);
      const notSelfParticipantId = conParticipants.filter(userId => userId !== participantId)[0]
      if (participantSocketId && notSelfParticipantId) {
        this.emitNotification(participantSocketId, 'selfClickedConIdResponse', {
          participantId: notSelfParticipantId,
          hasCurrentlyClickedConId: clickedConId,
          status: true,
        });
      }
    });
  }

  private async notifyNotSelfParticipantOfPreviousCon(
    previousConId: models.Conversation.id,
    userId: models.User.id,
    clickedConId: models.Conversation.id
  ) {
    const previousConParticipants = await conUtils.API.getUserIdsByConversationId(previousConId);
    previousConParticipants.forEach(participantId => {
      if (participantId !== userId) {
        const participantSocketId = this._authService.getSocketIdByUserId(participantId);
        if (participantSocketId) {
          this.emitNotification(participantSocketId, 'selfClickedConIdResponse', {
            participantId: userId,
            hasCurrentlyClickedConId: clickedConId,
            status: true
          });
        }
      }
    });
  }
  private notifySelfOfUnclickedCon(
    userId: models.User.id,
    conParticipants: models.User.id[],
    clickedConId: models.Conversation.id
  ) {
    const notSelf = conParticipants.filter(participantId => participantId !== userId)[0]
    const participantSocketId = this._authService.getSocketIdByUserId(userId);
    if (notSelf && participantSocketId) {
      this.emitNotification(participantSocketId, 'selfClickedConIdResponse', {
        participantId: notSelf,
        hasCurrentlyClickedConId: clickedConId,
        status: false,
      });
    }
  }

}
