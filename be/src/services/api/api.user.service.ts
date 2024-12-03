import * as db from '../../config/db'
import * as models from '../../models'

export class ApiUserService {

    public async getAllUsers(): Promise<models.User[]> {
        const pool = await db.connectToDatabase();
        const result = await pool.query('SELECT * FROM Users');
        return result.recordset as models.User[];
    }

    public async getUserById(id: string): Promise<models.User | undefined> {
        const pool = await db.connectToDatabase();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Users WHERE id = @id');

        return result.recordset[0] as models.User | undefined;
    }

    public async createUser(newUser: models.User): Promise<models.User> {
        const pool = await db.connectToDatabase();
        const result = await pool.request()
            .input('Name', newUser.name)
            .query('INSERT INTO Users (Name) OUTPUT inserted.* VALUES (@Name)');

        const createdUser = result.recordset[0] as models.User;

        if (!createdUser) {
            throw new Error('User creation failed');
        }

        return createdUser;
    }

    public async updateUser(id: string, updatedUser: Partial<models.User>): Promise<models.User | undefined> {
        const pool = await db.connectToDatabase();
        const result = await pool.request()
            .input('Id', id)
            .input('Name', updatedUser.name)
            .query(`
                UPDATE Users 
                SET Name = @Name 
                OUTPUT inserted.* 
                WHERE Id = @Id
            `);

        return result.recordset[0] as models.User | undefined;
    }

    public async deleteUser(id: string): Promise<models.User | undefined> {
        const pool = await db.connectToDatabase();
        const result = await pool.request()
            .input('Id', id)
            .query(`
                DELETE FROM Users 
                OUTPUT deleted.* 
                WHERE Id = @Id
            `);

        return result.recordset[0] as models.User | undefined;
    }
}