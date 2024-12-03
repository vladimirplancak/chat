import * as router from 'express'
import { messageController } from '../controllers/message.controller'


const routerObj = router.Router();



routerObj.get('/messages', messageController.getAllMessages)
routerObj.get('/messages/:id', messageController.getMessageById)
routerObj.get('/conversationMessages/:id', messageController.getMessagesByConversationId)
routerObj.put('/messages/:id', messageController.updateMessage)
routerObj.delete('/messages/:id', messageController.deleteMessage)

export default routerObj