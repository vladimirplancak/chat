import * as db from '../../config/db'
import * as models from '@common/models'

export class ApiMessageService {


    public async getAllMessages(): Promise<models.Conversation.Message[]> {
        try {
            const pool = await db.connectToDatabase()
            const result = await pool.query('SELECT * FROM Messages')
            return result.recordset as models.Conversation.Message[]
        } catch (error) {
            console.error('Error retrieving messages from database:', error)
            throw error
        }
    }


    public async saveMessage(message: models.Conversation.Message.Input): Promise<models.Conversation.Message> {
        try {
            const pool = await db.connectToDatabase()
            const result = await pool.request()
                .input('content', message.content)
                .input('conversationId', message.conId)
                .input('userId', message.userId)
                .input('dateTime', message.dateTime)
                .input('isSeen', message.isSeen)
                .query(`
              INSERT INTO Messages (content, conversationId, userId, dateTime, isSeen)
              OUTPUT inserted.*
              VALUES (@content, @conversationId, @userId, @dateTime, @isSeen)
            `)

            const createdMessage: models.Conversation.Message = result.recordset[0]

            if (!createdMessage) {
                throw new Error('Message creation failed')
            }

            return createdMessage
        } catch (error) {
            console.error('Error saving message to database:', error)
            throw error
        }
    }

    public async getMessagesByConversationId(conversationId: string): Promise<models.Conversation.Message[]> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('conversationId', conversationId)
            .query(`SELECT * 
                FROM Messages 
                WHERE conversationId = @conversationId`)
        const message: models.Conversation.Message[] | [] = result.recordset
        return message
    }
    
    public async seenSelfMsgIdsByConversationId(
        selfId: string, 
        conversationId: string
    ): Promise<Record<string, string[]>> {
        const pool = await db.connectToDatabase()
    
        // Step 1: Get message IDs
        const result = await pool.request()
            .input('conversationId', conversationId)
            .input('userId', selfId)
            .query(`SELECT id 
                    FROM Messages 
                    WHERE conversationId = @conversationId AND userId = @userId`)
    
        const messageIds = result.recordset.map((record) => record.id)
    
        if (messageIds.length === 0) {
            // No message IDs found
            return {}
        }
    
        // Step 2: Dynamically generate query for messageIds
        const query = `
            SELECT messageId, userId
            FROM MessageSeen
            WHERE messageId IN (${messageIds.map((_, i) => `@id${i}`).join(',')})
        `
    
        const request = pool.request()
    
        // Dynamically bind each messageId to the query
        messageIds.forEach((id, index) => {
            request.input(`id${index}`, id)
        })
    
        const queryResult = await request.query(query)
    
        // Step 3: Group userIds by messageId
        const groupedByMessageId: Record<string, string[]> = {}
    
        queryResult.recordset.forEach((row) => {
            const { messageId, userId } = row
            if (!groupedByMessageId[messageId]) {
                groupedByMessageId[messageId] = []
            }
            groupedByMessageId[messageId].push(userId)
        })
    // console.log(`source:`, groupedByMessageId)
        return groupedByMessageId
    }
    
    public async getMessageById(id: string): Promise<models.Conversation.Message | null> {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('id', id)
            .query(`
            SELECT * 
            FROM Messages 
            WHERE id = @id
        `)
        return result.recordset[0] || null
    }

    public async updateMessage(id: string, messageBody: string): Promise<models.Conversation.Message | null> {
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

    public async deleteMessage(id: string): Promise<models.Conversation.Message | null> {
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

    public async setPrivConvMessagesAsSeen
    (conId: models.Conversation.Id,selfId: models.User.Id):
    Promise<Record<models.User.Id, { seenMessageIds: string[], conversationId: string }> | null> 
    {
        const pool = await db.connectToDatabase()
        const lowerCaseConId = conId.toLowerCase()
        const lowerCaseSelfId = selfId.toLowerCase()
        const result = await pool.request()
            .input('conversationId', lowerCaseConId)
            .input('selfId', lowerCaseSelfId)
            .query(`
                WITH UpdatedMessages AS (
                    SELECT id, userId
                    FROM Messages
                    WHERE conversationId = @conversationId
                      AND userId != @selfId
                      AND (isSeen = 0 OR isSeen IS NULL)
                )
                UPDATE Messages
                SET isSeen = 1
                OUTPUT INSERTED.id AS messageId, INSERTED.userId
                WHERE id IN (SELECT id FROM UpdatedMessages)
            `)
       
        if (result.recordset.length > 0) {
            const groupedByUserId: Record<string, { seenMessageIds: string[], conversationId: string }> = {}
    
            result.recordset.forEach(row => {
                const userId = row.userId
                if (!groupedByUserId[userId]) {
                    groupedByUserId[userId] = {
                        seenMessageIds: [],
                        conversationId: lowerCaseConId 
                    }
                }
                groupedByUserId[userId].seenMessageIds.push(row.messageId)
            })
           
            return groupedByUserId
        }
    
        return null 
    }

    public async setPubConvMessagesAsSeen(conId: models.Conversation.Id,selfId: models.User.Id):
     Promise<any> 
     {
        const pool = await db.connectToDatabase()

        //const lowerCaseConId = conId.toLowerCase()
        const lowerCaseSelfId = selfId.toLowerCase()
        const allPubConMsgs = await this.getMessagesByConversationId(conId) 
        //console.log('setPubConvMessagesAsSeen', allPubConMsgs)
        
        //pub message Ids seen by the participant
        const allPubMsgsIds: string[] = []

        for (const pubMsg of allPubConMsgs) {
           
            // Check if the entry already exists
            const existingEntry = await pool.request()
                .input('messageId', pubMsg.id)
                .input('userId', lowerCaseSelfId)
                .query(`
                    SELECT 1
                    FROM MessageSeen
                    WHERE messageId = @messageId AND userId = @userId
                `)
            
            // If the entry doesn't exist, insert it
            if (existingEntry.recordset.length === 0 && pubMsg.userId != selfId ) {
                console.log(`does this ever work?`)
              const result =  await pool.request()
                    .input('messageId', pubMsg.id)
                    .input('userId', lowerCaseSelfId)
                    .query(`
                        INSERT INTO MessageSeen (messageId, userId)
                        OUTPUT inserted.*
                        VALUES (@messageId, @userId)
                    `)
            // collect all of the messageIds into a singular array for the purposes of using it
            // in a dynamic sql querry in order to obtain entire message, messageSeen objects of it
             const insertedRows = result.recordset
             //const messageId = insertedRows.map(row => row.messageId)
             const messageId = insertedRows.map(({messageId}) => messageId)
             allPubMsgsIds.push(...messageId)
            }
            
        }
        // console.log(`result refined:`, allPubMsgsIds)
        if(allPubMsgsIds.length > 0){
            const query =`
            SELECT
                m.conversationId,
                m.userId,
                m.id AS messageId,
                ms.userId as seenByUserIds
            FROM Messages AS m
            JOIN MessageSeen as ms
                ON m.id = ms.messageId
            WHERE m.id IN (${allPubMsgsIds.map((_,i)=>`@messageId${i}`).join(",")})
            `

            const request = pool.request()
            allPubMsgsIds.forEach((id, index)=>{
                request.input(`messageId${index}`, id)
            })

            const result = await request.query(query)
            // console.log("Joined Data:", result.recordset)
            
            //extract distinct(set) userIds(senderIds) that we need to dispatch the information to
            const seenPubMsgsObjs = result.recordset
             console.log(`1[seenPubMsgsObjs]:`, seenPubMsgsObjs)
            const msgSendersIds = [
                ...new Set(seenPubMsgsObjs.map(({userId})=> userId))
            ]
            //  console.log(`2[msgSendersIds]:`,msgSendersIds)
            //format the payload to match the expecting type of the front end

            
            // Group messages by userId
            const userMessagesRecord = seenPubMsgsObjs.reduce((acc, { userId, ...rest }) => {
                if (!acc[userId]) {
                    acc[userId] = [] // If the userId doesn't exist, initialize an empty array
                }
                acc[userId].push(rest) // Add the message object to the user's array
                return acc
            }, {})
            
            console.log(JSON.stringify(userMessagesRecord, null, 2))
            // console.log(`final return obj:`, userMessagesRecord)
            return userMessagesRecord
       
        
    
        }
    }
    
}