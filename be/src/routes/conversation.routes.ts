import * as router from 'express'
import { conversationController }  from '../controllers/conversation.controller'
const routerObj = router.Router();

routerObj.get('/conversations/:userId', conversationController.getConversationsByUserId)
routerObj.get('/conversations/:id', conversationController.getConversationById)
routerObj.post('/conversations', conversationController.createConversation)
routerObj.put('/conversations/:id', conversationController.updateConversation)
routerObj.delete('/conversations/:id', conversationController.deleteConversation) 

export default routerObj