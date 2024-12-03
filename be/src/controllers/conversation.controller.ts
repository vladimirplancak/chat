import * as express from 'express'
import * as services from '../services'

export class ConversationController{
    private _apiConService: services.api.ApiConService

    constructor(apiConService: services.api.ApiConService) {
        this._apiConService = apiConService
    }

    public getConversationsByUserId = async (req: express.Request, res: express.Response): Promise<void> => {
        const { userId } = req.params
        try {
            const conversations = await this._apiConService.getConversationsByUserId(userId)
            res.json(conversations)
        } catch (err) {
            console.error('Error retrieving conversations:', err)
            res.status(500).json({ message: 'Error retrieving conversations' })
        }
    }


    public getConversationById = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        try {
            const conversation = await this._apiConService.getConversationById(id)

            if (!conversation) {
                res.status(404).json({ message: 'Conversation not found' })
            
            }

            res.json(conversation)
        } catch (err) {
            console.error('Error retrieving conversation:', err)
            res.status(500).json({ message: 'Error retrieving conversation' })
        }
    }

    public createConversation = async (req: express.Request, res: express.Response): Promise<void> => {
        const newConv = req.body
        try {
            const createdConversation = await this._apiConService.createConversation(newConv)
            res.status(201).json(createdConversation)
        } catch (err) {
            console.error('Error creating conversation:', err)
            res.status(500).json({ message: 'Error creating conversation' })
        }
    }

    public updateConversation = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        const { participantIdsToAdd, participantIdsToRemove } = req.body

        try {
            const updatedConversation = await this._apiConService.updateConversationParticipants(id, participantIdsToAdd, participantIdsToRemove)
            res.status(200).json(updatedConversation)
        } catch (err) {
            console.error('Error updating conversation:', err)
            res.status(500).json({ message: 'Error updating conversation' })
        }
    }

    public deleteConversation = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        try {
            const deletedConversation = await this._apiConService.deleteConversation(id)
            res.status(200).json(deletedConversation)
        } catch (err) {
            console.error('Error deleting conversation:', err)
            res.status(500).json({ message: 'Error deleting conversation' })
        }
    }

}
const apiConversationService = new services.api.ApiConService()
export const conversationController = new ConversationController(apiConversationService)


