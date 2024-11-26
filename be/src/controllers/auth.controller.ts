import * as express from 'express'
import * as db from '../config/db'
import * as models from '../models'
import jwt from 'jsonwebtoken' // this wont work with namespace-type of import
import * as bcrypt from 'bcrypt'
import * as crypto from 'crypto'
import * as uniqueIdGenerator from 'uuid'

const JWT_SECRET = crypto.randomBytes(64).toString('hex')
console.log('Your generated JWT_SECRET:', JWT_SECRET)

/**
 * Registers a new user by creating an entry in both the Users and UserAuth tables.
 *
 * This method expects the request body to contain a username and password.
 * It generates a unique UserId, hashes the password using bcrypt, and inserts
 * the user's information into the database. If the username or password is
 * missing, it responds with a 400 status code. If the registration is successful,
 * it responds with a 201 status code and a success message. If an error occurs,
 * it responds with a 500 status code and an error message.
 *
 * @param {express.Request} req - The request object containing the user's registration details.
 * @param {express.Response} res - The response object used to send the result back to the client.
 * 
 * @returns {Promise<void>} - A promise that resolves to void. The response is sent directly to the client.
 */
export const registerUser = async (req: express.Request, res: express.Response) => {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
    }

    try {
        // generate a unique ID for new users
        const userId = uniqueIdGenerator.v4()

        const hashedPassword = await bcrypt.hash(password, 10)

        const pool = await db.connectToDatabase()

        // Insert into dbo.Users table
        await pool.request()
            .input('UserId', userId)
            .input('Name', username)
            .query('INSERT INTO Users (Id, Name) VALUES (@UserId, @Name)')
        // insert into dbo.UserAuth   
        await pool.request()

            .input('UserId', userId)
            .input('Username', username)
            .input('PasswordHash', hashedPassword)
            .query(`
                INSERT INTO UserAuth (UserId, Username, PasswordHash) 
                VALUES (@UserId, @Username, @PasswordHash)
            `)

        res.status(201).json({ message: 'User registered successfully' })
    } catch (err) {
        console.error('Error registering user:', err)
        res.status(500).json({ message: 'Error registering user' })
    }
}
/**
 * Authenticates a user by validating their credentials against the UserAuth table.
 *
 * This method expects the request body to contain a username and password.
 * It first checks if the username exists in the database. If it does not, 
 * it responds with a 401 status code indicating invalid credentials. If the 
 * username exists, it compares the provided password with the stored hashed 
 * password using bcrypt. If the passwords match, it generates a JWT token 
 * for the user and responds with a 200 status code and the token. If an error 
 * occurs during the process, it responds with a 500 status code and an error message.
 *
 * @param {express.Request} req - The request object containing the user's login credentials.
 * @param {express.Response} res - The response object used to send the result back to the client.
 * 
 * @returns {Promise<void>} - A promise that resolves to void. The response is sent directly to the client.
 */
export const loginUser = async (req: express.Request, res: express.Response): Promise<void> => {
    const { username, password }: models.UserAuth = req.body

    if (!username || !password) {
        res.status(400).json({ message: 'Username and password are required' })
    }
    // Generate a hash for the password '1234'
    // bcrypt.hash('1234', 12).then(hashedPassword => {
    //     console.log("Hashed password:", hashedPassword)
    //   })
    try {
        const pool = await db.connectToDatabase()


        const result = await pool.request()
            .input('Username', username)
            .query('SELECT UserId, PasswordHash FROM UserAuth WHERE Username = @Username')

        if (result.recordset.length === 0) {
            res.status(401).json({ message: 'Invalid credentials' })
            return
        }

        const { UserId, PasswordHash } = result.recordset[0]

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, PasswordHash)

        if (!isMatch) {
            res.status(401).json({ message: 'Invalid credentials' })
            return
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: UserId }, JWT_SECRET, { expiresIn: '10m' })
        // Generate a Refresh Token
        const refreshToken = crypto.randomBytes(64).toString('hex')
        const expiration = new Date()
        
        expiration.setMinutes(expiration.getMinutes() + 60) 
         // Remove milliseconds because javascript compares
         // time values on a mili-second level
         // for example: 14:00:00.500 is the same as 14:00:00
        expiration.setMilliseconds(0)
        // Store Refresh Token in Database
        await pool.request()
            .input('UserId', UserId)
            .input('Token', refreshToken)
            .input('Expiration', expiration)
            .query(`
            INSERT INTO RefreshTokens (UserId, Token, Expiration)
            VALUES (@UserId, @Token, @Expiration)
        `)

        res.status(200).json({
            message: 'Login successful',
            accessToken: token,
            refreshToken: refreshToken
        })

        return
    } catch (err) {
        console.error('Error logging in user:', err)
        res.status(500).json({ message: 'Error logging in user' })
        return
    }
}
//TODO: connect this with the front end in order to delete the refresh token up on logging out.
export const logoutUser = async (req: express.Request, res: express.Response): Promise<void> => {
    const { userId } = req.params
    console.log(`I RUN`, userId)
    if (!userId) {
        res.status(400).json({ message: 'User ID is required for logout' })
        return
    }

    try {
        const pool = await db.connectToDatabase()
        await pool.request()
            .input('UserId', userId)
            .query(`
                DELETE FROM RefreshTokens
                WHERE UserId = @UserId
            `)

        res.status(200).json({ message: 'User logged out successfully' })
    } catch (err) {
        console.error('Error logging out user:', err)
        res.status(500).json({ message: 'Error logging out user' })
    }
}


export const refreshToken = async (req: express.Request, res: express.Response): Promise<void> => {
    const  tokenPayload  = req.body
    console.log(`refreshTokenPayload`, req.body)
    if (!tokenPayload.refreshToken) {
        res.status(400).json({ message: 'No refresh token provided!' })
        return
    }
    try {
        const pool = await db.connectToDatabase()
        const result = await pool.request()
            .input('Token', tokenPayload.refreshToken)
            .query(`
                SELECT UserId, Expiration 
                FROM RefreshTokens 
                WHERE Token = @Token
            `)

        if (result.recordset.length == 0) {
            res.status(400).json({ message: 'Refresh token not found.' })
            return
        }
        const { UserId, Expiration } = result.recordset[0]
        const currentTime = new Date()

        if (new Date(Expiration).getTime() <= currentTime.getTime()) {
            res.status(400).json({ message: 'Your session has expired.' })
            return
        }

        const newAccessToken = jwt.sign({ userId: UserId }, JWT_SECRET, { expiresIn: '10m' })
        res.status(200).json({ accessToken: newAccessToken })

    } catch (err) {
        console.error('Error refreshing token:', err)
        res.status(500).json({ message: 'Error refreshing token' })
        
    }
}
