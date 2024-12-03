import * as router from 'express'
import { userController } from '../controllers/user.controller'

const routerObj = router.Router()

routerObj.get('/users',userController.getUsers)
routerObj.get('/users/:id', userController.getUserById)
routerObj.post('/users', userController.createUser)
routerObj.put('/users/:id', userController.updateUser)
routerObj.delete('/users/:id', userController.deleteUser) 

export default routerObj 
