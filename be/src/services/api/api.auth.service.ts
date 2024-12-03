import * as db from '../../config/db'
import * as models from '../../models'
import jwt from 'jsonwebtoken'
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import * as uniqueIdGenerator from 'uuid'

const JWT_SECRET = crypto.randomBytes(64).toString('hex')
console.log('Your generated JWT_SECRET:', JWT_SECRET)

export class ApiAuthService {

    public async registerUser(registerInformation: models.Auth.registerInfo): Promise<void> {
        const { username, password } = registerInformation

        if (!username || !password) {
            throw new Error('Username and password are required.')
        }

        try {
            const userId = uniqueIdGenerator.v4()
            const hashedPassword = await bcrypt.hash(password, 10)
            const pool = await db.connectToDatabase()

            // Insert into dbo.Users table
            await pool.request()
                .input('UserId', userId)
                .input('Name', username)
                .query('INSERT INTO Users (Id, Name) VALUES (@UserId, @Name)')

            // Insert into dbo.UserAuth   
            await pool.request()
                .input('UserId', userId)
                .input('Username', username)
                .input('PasswordHash', hashedPassword)
                .query(`
                    INSERT INTO UserAuth (UserId, Username, PasswordHash) 
                    VALUES (@UserId, @Username, @PasswordHash)
                `)
        } catch (error) {
            console.error('Error registering user:', error)
            throw error
        }
    }

    public async loginUser(username: string, password: string): Promise<{ accessToken: string, refreshToken: string }> {
        if (!username || !password) {
            throw new Error('Username and password are required.')
        }

        try {
            const pool = await db.connectToDatabase()
            const result = await pool.request()
                .input('Username', username)
                .query('SELECT UserId, PasswordHash FROM UserAuth WHERE Username = @Username')

            if (result.recordset.length === 0) {
                throw new Error('Invalid credentials.')
            }

            const { UserId, PasswordHash } = result.recordset[0]
            const isMatch = await bcrypt.compare(password, PasswordHash)

            if (!isMatch) {
                throw new Error('Invalid credentials.')
            }

            const accessToken = jwt.sign({ userId: UserId }, JWT_SECRET, { expiresIn: '10m' })
            const refreshToken = crypto.randomBytes(64).toString('hex')
            const expiration = new Date()
            expiration.setMinutes(expiration.getMinutes() + 60)
            expiration.setMilliseconds(0)

            await pool.request()
                .input('UserId', UserId)
                .input('Token', refreshToken)
                .input('Expiration', expiration)
                .query(`
                    INSERT INTO RefreshTokens (UserId, Token, Expiration)
                    VALUES (@UserId, @Token, @Expiration)
                `)

            return { accessToken, refreshToken }
        } catch (error) {
            console.error('Error logging in user2:', error)
            throw error
        }
    }

    public async logoutUser(userId: string): Promise<void> {
        if (!userId) {
            throw new Error('User ID is required for logout.')
        }

        try {
            const pool = await db.connectToDatabase()
            await pool.request()
                .input('UserId', userId)
                .query(`
                    DELETE FROM RefreshTokens
                    WHERE UserId = @UserId
                `)
        } catch (error) {
            console.error('Error logging out user:', error)
            throw error
        }
    }

    public async refreshToken(refreshToken: string): Promise<string> {
        if (!refreshToken) {
            throw new Error('No refresh token provided.')
        }

        try {
            const pool = await db.connectToDatabase()
            const result = await pool.request()
                .input('Token', refreshToken)
                .query(`
                    SELECT UserId, Expiration 
                    FROM RefreshTokens 
                    WHERE Token = @Token
                `)

            if (result.recordset.length === 0) {
                throw new Error('Refresh token not found.')
            }

            const { UserId, Expiration } = result.recordset[0]
            const currentTime = new Date()

            if (new Date(Expiration).getTime() <= currentTime.getTime()) {
                throw new Error('Your session has expired.')
            }

            const newAccessToken = jwt.sign({ userId: UserId }, JWT_SECRET, { expiresIn: '10m' })
            return newAccessToken
        } catch (error) {
            console.error('Error refreshing token:', error)
            throw error
        }
    }
}
