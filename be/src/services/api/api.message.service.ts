import * as db from '../../config/db'
import * as models from '../../models'

export class ApiMessageService{

    public async saveMessage(message: models.Messages.FrontendMessage): Promise<models.Messages.Message> {
        try {
          const pool = await db.connectToDatabase()
          const result = await pool.request()
            .input('content', message.content)
            .input('conversationId', message.conId)
            .input('userId', message.userId)
            .input('dateTime', message.datetime)
            .query(`
              INSERT INTO Messages (content, conversationId, userId, dateTime)
              OUTPUT inserted.*
              VALUES (@content, @conversationId, @userId, @dateTime)
            `)
    
          const createdMessage: models.Messages.Message= result.recordset[0]
    
          if (!createdMessage) {
            throw new Error('Message creation failed')
          }

          return createdMessage
        } catch (error) {
          console.error('Error saving message to database:', error)
          throw error
        }
      }
}