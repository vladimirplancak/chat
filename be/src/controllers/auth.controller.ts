import * as express from 'express'
import * as services from '../services'

export class AuthController {
    private _apiAuthService: services.api.ApiAuthService

    constructor(apiAuthService: services.api.ApiAuthService) {
        this._apiAuthService = apiAuthService
    }

    public registerUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            await this._apiAuthService.registerUser(req.body)
            res.status(201).json({ message: 'User registered successfully' })
        } catch (error) {
            console.error('Error registering user:', error)
            res.status(500).json({ message: 'Error registering user.' })
        }
    }

    public loginUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const { username, password } = req.body
            const tokens = await this._apiAuthService.loginUser(username, password)
            res.status(200).json({ message: 'Login successful', ...tokens })
        } catch (error) {
            console.error('Error logging in user1:', error)
            res.status(401).json({ message: error instanceof Error ? error.message : 'Unauthorized' })
        }
    }

    public logoutUser = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const { userId } = req.params
            await this._apiAuthService.logoutUser(userId)
            res.status(200).json({ message: 'User logged out successfully' })
        } catch (error) {
            console.error('Error logging out user:', error)
            res.status(500).json({ message: 'Error logging out user.' })
        }
    }

    public refreshToken = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const { refreshToken } = req.body
            const accessToken = await this._apiAuthService.refreshToken(refreshToken)
            res.status(200).json({ accessToken })
        } catch (error) {
            console.error('Error refreshing token:', error)
            res.status(400).json({ message: 'Error refreshing token.' })
        }
    }
}

const apiAuthService = new services.api.ApiAuthService()
export const authController = new AuthController(apiAuthService)

