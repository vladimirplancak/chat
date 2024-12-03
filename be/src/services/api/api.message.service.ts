import * as db from '../../config/db'
import * as models from '../../models'

export class ApiMessageService {

    public async getAllMessages(): Promise<models.Messages.Message[]> {
        try {
            const pool = await db.connectToDatabase();
            const result = await pool.query('SELECT * FROM Messages');
            return result.recordset as models.Messages.Message[];
        } catch (error) {
            console.error('Error retrieving messages from database:', error);
            throw error;
        }
    }


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

            const createdMessage: models.Messages.Message = result.recordset[0]

            if (!createdMessage) {
                throw new Error('Message creation failed')
            }

            return createdMessage
        } catch (error) {
            console.error('Error saving message to database:', error)
            throw error
        }
    }

    public async getMessagesByConversationId(conversationId: string): Promise<models.Messages.Message[]> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('conversationId', conversationId)
            .query(`SELECT * 
                FROM Messages 
                WHERE conversationId = @conversationId`)
        const message: models.Messages.Message[] | [] = result.recordset
        return message
    }

    public async getMessageById(id: string): Promise<models.Messages.Message | null> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('id', id)
            .query(`
            SELECT * 
            FROM Messages 
            WHERE id = @id
        `)
        console.log(`result.recordset[0]`, result.recordset[0])
        return result.recordset[0] || null
    }

    public async updateMessage(id: string, messageBody: string): Promise<models.Messages.Message | null> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('id', id)
            .input('messageBody', messageBody)
            .query(`
            UPDATE Messages 
            SET messageBody = @messageBody 
            OUTPUT inserted.*
            WHERE id = @id
        `)

        return result.recordset[0] || null
    }

    public async deleteMessage(id: string): Promise<models.Messages.Message | null> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('id', id)
            .query(`
            DELETE FROM Messages 
            OUTPUT deleted.*
            WHERE id = @id
        `)

        return result.recordset[0] || null
    }

}