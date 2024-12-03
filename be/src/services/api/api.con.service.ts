import * as db from '../../config/db'
import * as models from '../../models'
import * as utils from '../../utilities'
import mssql from 'mssql'

export class ApiConService {
    /**
    * Fetches all conversations associated with a specific user ID.
    * @param userId - The ID of the user.
    * @returns A promise resolving to an array of conversations.
    */
    public async getConversationsByUserId(userId: string): Promise<models.Conversation.Con[]> {
        const pool = await db.connectToDatabase();

        // Fetch conversation IDs associated with the user.
        const conversationIdsResult = await pool.request()
            .input('UserId', userId)
            .query('SELECT conversationId FROM Users_Conversations WHERE UserId = @UserId');

        const conversationIds = conversationIdsResult.recordset.map(record => record.conversationId);

        if (conversationIds.length === 0) return [];

        // Fetch conversations using a single query.
        const conversationsResult = await pool.request()
            .input('id', mssql.VarChar(mssql.MAX), conversationIds.join(','))
            .query(`
                SELECT * FROM Conversations 
                WHERE id IN (SELECT value FROM STRING_SPLIT(@id, ','))
            `);

        return conversationsResult.recordset;
    }

    /**
     * Fetches a single conversation by its ID.
     * @param conversationId - The unique ID of the conversation.
     * @returns A promise resolving to the conversation or undefined if not found.
     */
    public async getConversationById(conversationId: string): Promise<models.Conversation.Con | undefined> {
        const pool = await db.connectToDatabase();

        const result = await pool.request()
            .input('id', conversationId)
            .query('SELECT * FROM Conversations WHERE id = @id');

        return result.recordset[0];
    }

    /**
     * Creates a new conversation and associates participants.
     * @param newConv - The conversation data to create.
     * @returns A promise resolving to the created conversation.
     */
    public async createConversation(newConv: models.Conversation.ConWithParticipants): Promise<models.Conversation.Con> {
        const pool = await db.connectToDatabase();

        // Find user for naming the conversation.
        const findUser = await pool.request()
            .input('Id', newConv.participantIds[1])
            .query('SELECT * FROM Users WHERE Id = @Id');

        if (!findUser.recordset.length) {
            throw new Error('Participant not found.');
        }

        const conversationName = findUser.recordset[0].name;

        // Insert the conversation.
        const createConv = await pool.request()
            .input('Name', conversationName)
            .input('CreatorId', newConv.creatorId)
            .query('INSERT INTO Conversations (Name, CreatorId) OUTPUT inserted.* VALUES (@Name, @CreatorId)');

        const createdConversation: models.Conversation.Con = createConv.recordset[0];

        if (!createdConversation) {
            throw new Error('Conversation creation failed');
        }

        // Associate participants.
        for (const userId of newConv.participantIds) {
            await pool.request()
                .input('UserId', userId)
                .input('ConversationId', createdConversation.id)
                .query('INSERT INTO Users_Conversations (UserId, ConversationId) VALUES (@UserId, @ConversationId)');
        }

        return createdConversation;
    }

    /**
     * Updates participants of an existing conversation.
     * @param id - The unique ID of the conversation to update.
     * @param participantIdsToAdd - Participant IDs to add.
     * @param participantIdsToRemove - Participant IDs to remove.
     * @returns A promise resolving to the updated conversation.
     */
    public async updateConversationParticipants(
        id: string,
        participantIdsToAdd?: string[],
        participantIdsToRemove?: string[]
    ): Promise<models.Conversation.Con> {
        return utils.ConUtils.updateConversationParticipants(id, participantIdsToAdd, participantIdsToRemove);
    }

    /**
     * Deletes a conversation and returns the deleted conversation with participants.
     * @param id - The unique ID of the conversation to delete.
     * @returns A promise resolving to the deleted conversation data.
     */
    public async deleteConversation(id: string): Promise<models.Conversation.ConWithParticipants> {
        const pool = await db.connectToDatabase();

        // Extract participants before deletion.
        const participantsInCon = await utils.ConUtils.getUserIdsByConversationId(id);

        // Delete the conversation.
        const result = await pool.request()
            .input('id', id)
            .query(`
                DELETE FROM Conversations 
                OUTPUT deleted.* 
                WHERE id = @id
            `);

        const deletedConversation: models.Conversation.ConWithParticipants = result.recordset[0];

        if (!deletedConversation) {
            throw new Error('Conversation not found or already deleted');
        }

        return {
            ...deletedConversation,
            participantIds: participantsInCon,
        };
    }
}