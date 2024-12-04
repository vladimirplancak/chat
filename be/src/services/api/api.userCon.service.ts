import * as db from '../../config/db'
import * as models from '../../models'

export class ApiUserConService {
    /**
      * Get all UserConversation objects for a specific user by userId.
      */
    public async getUsersConversationsByUserId(userId: string): Promise<models.UserConversation[]> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('UserId', userId)
            .query('SELECT * FROM Users_Conversations WHERE UserId = @UserId')

        return result.recordset as models.UserConversation[]
    }

    /**
     * Get all user IDs for a specific conversation by conversationId.
     */
    public async getUserIdsByConversationId(conversationId: string): Promise<string[]> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('ConversationId', conversationId)
            .query('SELECT * FROM Users_Conversations WHERE ConversationId = @ConversationId')

        const usersConversations: models.UserConversation[] = result.recordset
        return usersConversations.map(userConversation => userConversation.userId)
    }

    /**
     * Get participants of a specific conversation by conversationId.
     * Returns an object with conversationId and participantIds.
     */
    public async getParticipantsByConId(conversationId: string): Promise<{ id: string, participantIds: string[] } | null> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('ConversationId', conversationId)
            .query('SELECT * FROM Users_Conversations WHERE ConversationId = @ConversationId')

        const usersConversations: { userId: string, conversationId: string }[] = result.recordset
        
        // Group userIds by conversationId
        const conversations: { [key: string]: { id: string, participantIds: string[] } } = {}
     
        usersConversations.forEach(({ userId, conversationId: conId }) => {
            if (!conversations[conId]) {
                conversations[conId] = { id: conId, participantIds: [] }
            }
            conversations[conId].participantIds.push(userId)
        })
        
        // Return the relevant conversation or null if not found
        return conversations[conversationId] || null
    }
}