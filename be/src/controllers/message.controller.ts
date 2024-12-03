import * as express from 'express'
import * as services from '../services'

export class MessageController {
    private _apiMessageService: services.api.ApiMessageService

    constructor(apiMessageService: services.api.ApiMessageService) {
        this._apiMessageService = apiMessageService
    }

    public getAllMessages = async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const messages = await this._apiMessageService.getAllMessages()
            res.json(messages)
        } catch (err) {
            console.error('Error retrieving messages:', err)
            res.status(500).json({ message: 'Error retrieving messages.' })
        }
    }

    public getMessagesByConversationId = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        try {
            const messages = await this._apiMessageService.getMessagesByConversationId(id)
            res.json(messages)
        } catch (err) {
            console.error('Error retrieving Message:', err)
            res.status(500).json({ message: 'That conversationId does not exist.' })
        }
    }
 
    public getMessageById = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        try {
            const message = await this._apiMessageService.getMessageById(id)
            if (!message) {
                res.status(404).json({ message: 'Message not found' })
            } else {
                res.json(message)
            }
        } catch (err) {
            console.error('Error retrieving message:', err)
            res.status(500).json({ message: 'Error retrieving message' })
        }
    }

    public updateMessage = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        const updatedMessage = req.body.messageBody
        try {
            const message = await this._apiMessageService.updateMessage(id, updatedMessage)
            if (!message) {
                res.status(404).json({ message: 'Message not found or update failed' })
            } else {
                res.status(200).json(message)
            }
        } catch (err) {
            console.error('Error updating message:', err)
            res.status(500).json({ message: 'Error updating message' })
        }
    }

    public deleteMessage = async (req: express.Request, res: express.Response): Promise<void> => {
        const { id } = req.params
        try {
            const deletedMessage = await this._apiMessageService.deleteMessage(id)
            if (!deletedMessage) {
                res.status(404).json({ message: 'Message not found or already deleted' })
            } else {
                res.status(200).json({ message: 'Message deleted successfully', deletedMessage })
            }
        } catch (err) {
            console.error('Error deleting message:', err)
            res.status(500).json({ message: 'Error deleting message' })
        }
    }
}
// Instantiate and export the controller once
const apiMessageService = new services.api.ApiMessageService()
export const messageController = new MessageController(apiMessageService)


