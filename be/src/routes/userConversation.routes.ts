import * as router from 'express'
import { userConController }  from '../controllers/userConversation.controller'

const routerObj = router.Router();
routerObj.get('/conversationsList/:userId', userConController.getUsersConversationsByUserId)
routerObj.get('/conversationParticipants/:conversationId', userConController.getUserIdsByConversationId)
routerObj.get('/participantsByConId/:conversationId', userConController.getParticipantsByConId)

export default routerObj