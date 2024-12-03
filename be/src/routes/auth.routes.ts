import * as router from 'express'
import { authController }  from '../controllers/auth.controller'

const routerObj = router.Router()

routerObj.post('/register', authController.registerUser);
routerObj.post('/login', authController.loginUser)
routerObj.post('/logout/:userId', authController.logoutUser)
routerObj.post('/refresh', authController.refreshToken)
export default routerObj 
