import * as express from 'express'
import * as services from '../services'

export class UserConversationController {
    private _apiUserConService: services.api.ApiUserConService

    constructor(apiUserConService: services.api.ApiUserConService) {
        this._apiUserConService = apiUserConService
    }

    public getUsersConversationsByUserId = async (req: express.Request, res: express.Response): Promise<void> => {
        const { userId } = req.params
        try {
            const usersConversations = await this._apiUserConService.getUsersConversationsByUserId(userId)
            res.json(usersConversations)
        } catch (err) {
            console.error('Error retrieving usersConversations:', err)
            res.status(500).json({ message: 'Error retrieving usersConversations.' })
        }
    }

    /**
     * Get all user IDs for a specific conversation by conversationId.
     */
    public getUserIdsByConversationId = async (req: express.Request, res: express.Response): Promise<void> => {
        const { conversationId } = req.params
        try {
            const participantIds = await this._apiUserConService.getUserIdsByConversationId(conversationId)
            res.json(participantIds)
        } catch (err) {
            console.error('Error retrieving user IDs:', err)
            res.status(500).json({ message: 'Error retrieving user IDs.' })
        }
    }

    /**
     * Get participants of a specific conversation by conversationId.
     */
    public getParticipantsByConId = async (req: express.Request, res: express.Response): Promise<void> => {
        const { conversationId } = req.params
        try {
            const conversation = await this._apiUserConService.getParticipantsByConId(conversationId)

            if (conversation) {
                res.json(conversation)
            } else {
                res.json([])
            }
        } catch (err) {
            console.error('Error retrieving participants:', err)
            res.status(500).json({ message: 'Error retrieving participants.' })
        }
    }
}
const apiUserConService = new services.api.ApiUserConService()
export const userConController = new UserConversationController(apiUserConService)
