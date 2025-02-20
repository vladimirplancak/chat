// socket.con.service.ts
import * as socketIO from 'socket.io'
import * as models from '@common/models'
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
  public async notifyParticipantsOfPublicConClickedStatus
    (
      userId: models.User.Id,
      clickedConId: models.Conversation.Id,
      switchedPrivToPubConId?: models.Conversation.Id
    ) {
    try {
      //notify not self participant that the self has clicked away from the mutual private conv
      //to a public conversation.
      if (switchedPrivToPubConId) {
        this.notifyNotSelfParticipantOfPreviousCon(switchedPrivToPubConId, userId, clickedConId)
      }
      const clientCurrentConvIdClickedMap = this._authService.clientCurrentPublicConvIdClickedMap

      // 1. Identify the previous conversation this user clicked on (if any).
      const previousPubCon = clientCurrentConvIdClickedMap.get(userId)
      //console.log(`previousPubCon::`, previousPubCon)

      // 2. Update the map with the new clicked conversation for this user.
      clientCurrentConvIdClickedMap.set(userId, clickedConId)
      //console.log('current pub map::', clientCurrentConvIdClickedMap)

      // 3. Notify participants of the previous conversation (if any).
      if (previousPubCon && previousPubCon !== clickedConId) {

        const previousPubConParticipants = await conUtils.API.getUserIdsByConversationId(previousPubCon)
        // Filter participants who are still in the previous conversation.
        const stillClickedPreviousPubConParticipants = previousPubConParticipants.filter(
          participantId => clientCurrentConvIdClickedMap.get(participantId) === previousPubCon
        )
       
        const previousParticipantsMap = Object.fromEntries(
          previousPubConParticipants.map(participantId => [
            participantId,
            stillClickedPreviousPubConParticipants.includes(participantId),
          ])
        )

        // Notify participants of the previous conversation.
        previousPubConParticipants.forEach(participantId => {
          const participantSocketId = this._authService.getSocketIdByUserId(participantId)
          if (participantSocketId) {
            this._ioServer.to(participantSocketId).emit('selfClickedPubConIdResponse', {
              currentlyClickedPubCon: previousPubCon,
              participantIdsClickedStatus: previousParticipantsMap,
            })
          }
        })
      }
      // 4. Notify participants of the newly clicked conversation.
      const pubConParticipants = await conUtils.API.getUserIdsByConversationId(clickedConId)
      const currentlyClickedPubConParticipants = pubConParticipants.filter(
        participantId => clientCurrentConvIdClickedMap.get(participantId) === clickedConId
      )
      // Create a map with true for currently clicked participants and false for others.
      const participantsMap = Object.fromEntries(
        pubConParticipants.map(participantId => [
          participantId,
          currentlyClickedPubConParticipants.includes(participantId),
        ])
      )

      pubConParticipants.forEach(participantId => {
        const participantSocketId = this._authService.getSocketIdByUserId(participantId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('selfClickedPubConIdResponse', {
            currentlyClickedPubCon: clickedConId,
            participantIdsClickedStatus: participantsMap,
          })
        }
      })
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }

  public async notifyParticipantsOfPrivateConClickedStatus
    (
      userId: models.User.Id, 
      clickedConId: models.Conversation.Id, 
      switchedPubToPrivConId?: models.Conversation.Id
    ) {
    try {
      if (switchedPubToPrivConId) {
        const clientCurrentPubConvIdClickedMap = this._authService.clientCurrentPublicConvIdClickedMap
        // console.log('pub to priv swap happeneed', clientCurrentPubConvIdClickedMap)
        const pubConParticipants = await conUtils.API.getUserIdsByConversationId(switchedPubToPrivConId)
        const currentlyClickedPubConParticipants = pubConParticipants.filter(
          participantId => clientCurrentPubConvIdClickedMap.get(participantId) === switchedPubToPrivConId
        )
        const participantsMap = Object.fromEntries(
          pubConParticipants.map(participantId => [
            participantId,
            currentlyClickedPubConParticipants.includes(participantId),
          ])
        )
        pubConParticipants.forEach(participantId => {
          const participantSocketId = this._authService.getSocketIdByUserId(participantId)
          if (participantSocketId) {
            this._ioServer.to(participantSocketId).emit('selfClickedPubConIdResponse', {
              currentlyClickedPubCon: switchedPubToPrivConId,
              participantIdsClickedStatus: participantsMap,
            })
          }
        })
      }

      const clientCurrentConvIdClickedMap = this._authService.clientCurrentPrivateConvIdClickedMap
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
        // console.log(`case1`)
        this.notifyParticipantsOfSameCon(conParticipants, clickedConId)

        // case 1.1: notify the previous conversation notself participant of self clicking another conv
        if (previousConId && previousConId !== clickedConId) {
          // console.log(`case1.1`)
          this.notifyNotSelfParticipantOfPreviousCon(previousConId, userId, clickedConId)
        }
      }
      // case 2: notify previous conversation's notself of self clicking away from current conv
      else if (previousConId && previousConId !== clickedConId) {
        // console.log('case2')
        this.notifyNotSelfParticipantOfPreviousCon(previousConId, userId, clickedConId)

        // case 3: notify self that notself has not yet clicked on the con
      } else {
        //  console.log('case3')
        this.notifySelfOfUnclickedCon(userId, conParticipants, clickedConId)
      }
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }

  }

  /**This method handles the notification of addition of participants to the conversation */
  public async notifyConParticipantsOfAddion(conId: string) {
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
              {
                conId, 
                name: conversationName,
                participantIds: currentConParticipants
              })
        }
      })
    } catch (error) {
      console.error('Error emitting conversation participant update:', error)
    }
  }
  /**This method handles the notification of removal of the participants from the conversation */
  public async notifyParticipantsOfRemoval(conId: string, participantIds: models.Conversation.Backend.ConWithParticipants) {
    try {
      const removedParticipantIds = participantIds?.participantIdsToRemove
      const currentConParticipants = await conUtils.API.getUserIdsByConversationId(conId)

      //notify the client that he has been removed from the conversation
      removedParticipantIds?.forEach(userId => {
        const participantSocketId = this._authService.getSocketIdByUserId(userId)
        if (participantSocketId) {
          this._ioServer.to(participantSocketId).emit('conParticipantRemovedResponse', conId)
        }
      })

      //notify the remaining participants in that conversation of that user's removal
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
    con: models.Conversation.Backend.ConWithParticipants,
    addedParticipantsId: models.User.Id[]
  ) {
    try {
      // addedParticipantsId[1] is here because this is an addition to private conversation, where the
      // user's id (self) that is adding a participant's id (notself), is an array containing two values.
      const addedParticipantSocketId = this._authService.getSocketIdByUserId(addedParticipantsId[1])
      const conWithParticipants: models.Conversation.Backend.ConWithParticipants = {
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

  public async notifyClientsOfDeletedConversation(deletedConversation: models.Conversation.Backend.ConWithParticipants) {
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
    socket.on('updateConParticipantListRequest', (conId: string, participantIds: models.Conversation.Backend.ConWithParticipants) => {
      if (participantIds.participantIdsToAdd) {
        this.notifyConParticipantsOfAddion(conId)
      } else {
        this.notifyParticipantsOfRemoval(conId, participantIds)
      }
    })
    /**
     * This request method simply forwards the payload request to the notifier method.
     */
    socket.on('updateParticipantOfPrivateConCreationRequest',
      (
        con: models.Conversation.Backend.ConWithParticipants,
        addedParticipantsId: models.User.Id[]
      ) => {
        this.notifyAddedClientOfNewConversation(con, addedParticipantsId)
      })
    /**
      * Similarly, this request method forwards the payload request to the notifier method.
      */
    socket.on('deleteCoversationRequest', (deletedConversation: models.Conversation.Backend.ConWithParticipants) => {
      this.notifyClientsOfDeletedConversation(deletedConversation)
    })

    socket.on('selfClickedConIdRequest', async (userId: models.User.Id, clickedConId: models.Conversation.Id) => {
      // console.log(`received [userId][clickedConId]`, userId, clickedConId)
      const conParticipants = await conUtils.API.getUserIdsByConversationId(clickedConId)
      // console.log(`conParticipants:`, conParticipants)
      // Determine if the clicked conversation is private or public
      const isPrivateCon = conParticipants.length <= 2

      // Handle switching between private and public maps
      if (isPrivateCon) {
        // console.log('first IF')
        // If switching from public to private
        // console.log(`isPrivateCon`, isPrivateCon)
        if (this._authService.clientCurrentPublicConvIdClickedMap.get(userId)) {
          const prevPubConId = this._authService.clientCurrentPublicConvIdClickedMap.get(userId)
          // console.log(`prevPubConId`, prevPubConId)
          this._authService.clientCurrentPublicConvIdClickedMap.delete(userId)
          //we will inject this into the private con notifier method and there we will
          //return the same information as in our public con notifier method - simply notify everyone
          // in this previous pub con that this current user has now clicked on a priv conv.
          //this will be optional parameter conSwitchedPubToPriv and it will hold the value of previous
          //pub con before current user clicked on the private con.
          // console.log(`prepare payload for previous public conversation: ${prevPubConId}`)
          await this.notifyParticipantsOfPrivateConClickedStatus(userId, clickedConId, prevPubConId)

        }
        await this.notifyParticipantsOfPrivateConClickedStatus(userId, clickedConId)
      } else {
        // console.log(`this happens!`, userId, clickedConId)
        // console.log(`private map:`, this._authService.clientCurrentPrivateConvIdClickedMap)
        // If switching from private to public
        if (this._authService.clientCurrentPrivateConvIdClickedMap.get(userId)) {
          const prevPrivConId = this._authService.clientCurrentPrivateConvIdClickedMap.get(userId)
          this._authService.clientCurrentPrivateConvIdClickedMap.delete(userId)
          //console.log(`prepare payload for previous private conversation:: ${prevPrivConId}`)
          await this.notifyParticipantsOfPublicConClickedStatus(userId, clickedConId, prevPrivConId)
        }
        await this.notifyParticipantsOfPublicConClickedStatus(userId, clickedConId)
      }
    })
  }

  //----------------------------------- HELPER METHODS ---------------------------------------//
  //TODO: maybe move these helper methods into conversation-utils.ts ????
  private emitNotification(socketId: string, name: string, payload: any) {
    this._ioServer.to(socketId).emit(name, payload)
  }

  private async notifyParticipantsOfSameCon(
    conParticipants: models.User.Id[],
    clickedConId: models.Conversation.Id
  ) {
    conParticipants.forEach(participantId => {
      const participantSocketId = this._authService.getSocketIdByUserId(participantId)
      const notSelfParticipantId = conParticipants.filter(userId => userId !== participantId)[0]

      if (participantSocketId && notSelfParticipantId) {
        this.emitNotification(participantSocketId, 'selfClickedConIdResponse', {
          participantId: notSelfParticipantId,
          hasCurrentlyClickedConId: clickedConId,
          status: true,
        })
      }
    })
  }

  private async notifyNotSelfParticipantOfPreviousCon(
    previousConId: models.Conversation.Id,
    userId: models.User.Id,
    currentConId: models.Conversation.Id
  ) {
    const previousConParticipants = await conUtils.API.getUserIdsByConversationId(previousConId)
    previousConParticipants.forEach(participantId => {
      if (participantId !== userId) {
        const participantSocketId = this._authService.getSocketIdByUserId(participantId)
        if (participantSocketId) {
          this.emitNotification(participantSocketId, 'selfClickedConIdResponse', {
            participantId: userId,
            hasCurrentlyClickedConId: currentConId,
            status: true
          })
        }
      }
    })
  }
  private notifySelfOfUnclickedCon(
    userId: models.User.Id,
    conParticipants: models.User.Id[],
    clickedConId: models.Conversation.Id
  ) {
    const notSelf = conParticipants.filter(participantId => participantId !== userId)[0]
    const selfSocketId = this._authService.getSocketIdByUserId(userId)
    if (notSelf && selfSocketId) {
      this.emitNotification(selfSocketId, 'selfClickedConIdResponse', {
        participantId: notSelf,
        hasCurrentlyClickedConId: clickedConId,
        status: false,
      })
    }
  }

}
