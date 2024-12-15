

import assert from 'assert';
import bcrypt from 'bcrypt';

import { buildFieldNameArray, buildFieldArrays, convertObjectFromDb } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';
import { comaintErrors, buildComaintError } from '../../../common/src/error.mjs';
import { AccountState } from '../../../common/src/global.mjs';

const defaultResultPropertyList = [ 'id', 'email', 'firstname', 'lastname' ];
const defaultOrderPropertyList = [ 'email' ];

class UserModel {
    #db = null;
    #hashSalt = null;

    initialize (db, hashSalt) {
        assert (db !== undefined);
        assert (hashSalt !== undefined);
        this.#db = db;
        this.#hashSalt = parseInt(hashSalt);
    }


    async findUserList(properties = null, filters = null, pagination = null) {
        assert(this.#db !== null);
        if (properties === null)
            properties = defaultResultPropertyList;
        if (!(properties instanceof Array))
            throw new Error("Parameter «properties» is not an array");
        if (typeof(filters) !== 'object')
            throw new Error("Parameter «filters» is not an object");

        const sqlFields = buildFieldNameArray(userObjectDef, properties);
        if (sqlFields.length === 0)
            throw new Error("No request properties found");

        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, filters);
        const sqlWhere = fieldNames.length === 0 ? '' :
            'WHERE ' + fieldNames.map(f => `${f} = ?`).join(' AND ');

        const sortProperties = defaultOrderPropertyList;
        const sortFieldNames = buildFieldNameArray(userObjectDef, sortProperties);
        const sqlSort = sortFieldNames.map === 0 ? '' :
            'ORDER BY ' + sortFieldNames.map(f => `${f}`).join(', ');

        // get record counts
        let sql = `SELECT COUNT(*) as count FROM users ${sqlWhere}`;
        const result = await this.#db.query(sql, fieldValues);
        let recordCount = result[0]['count'];

        const userList = [];

        // get record of selected page
        if ( recordCount > 0 ) {
            sql = `SELECT ${sqlFields} FROM users ${sqlWhere} ${sqlSort} LIMIT ? OFFSET ?`;
            fieldValues.push(pagination.limit, pagination.offset);
            const result = await this.#db.query(sql, fieldValues);

            for (let userRecord of result) {
                const user = convertObjectFromDb(userObjectDef, userRecord);
                userList.push(user);
            }
        }

        return {
            userList,
            page: pagination.page,
            limit: pagination.limit,
            count: recordCount
        };
    }

    async getUserById(userId) {
        if (userId === undefined)
            throw new Error('Argument <userId> required');
        if (isNaN(userId))
            throw new Error('Argument <userId> is not a number');
        let sql = `SELECT * FROM users WHERE id = ?`;
        const result = await this.#db.query(sql, [userId]);
        if (result.length === 0)
            return null;
        const userRecord = result[0];
        const user = convertObjectFromDb(userObjectDef, userRecord);
        // TODO filter properties
        return user;
    }

    async getUserByEmail(email) {
        if (email === undefined)
            throw new Error('Argument <email> required');
        let sql = `SELECT * FROM users WHERE email = ?`;
        const result = await this.#db.query(sql, [email]);
        if (result.length === 0)
            return null;
        const userRecord = result[0];
        const user = convertObjectFromDb(userObjectDef, userRecord);
        // TODO filter properties
        return user;
    }



    async createUser(user) {
        if (user.password === undefined || user.password === null)
            throw new Error('User password missing');
        await this.encryptPasswordIfPresent(user);

        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, user);
        const markArray = Array(fieldValues.length).fill('?').join(',');
        const sqlRequest = `
            INSERT INTO users(${fieldNames.join(', ')}) VALUES (${markArray})
        `;
        try {
            const result = await this.#db.query(sqlRequest, fieldValues);
            const userId = result.insertId;
            user = await this.getUserById(userId);
            return user;
        }
        catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const match = error.message.match(/Duplicate entry '.*' for key '(\w+)'/);
                if (match) {
                    let field = match[1];
                    if (field.startsWith("idx_"))
                        field = field.slice(4);
                    error = buildComaintError(comaintErrors.CONFLICT_ERROR, {field, object: 'user'});
                }
            }
            throw error;
        }
    }


    async editUser(user) {
        await this.encryptPasswordIfPresent(user);

        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, user);
        const sqlRequest = `UPDATE users SET ${fieldNames.map(field => `${field}=?`).join(', ')} WHERE id = ?`;
        fieldValues.push(user.id); // WHERE clause

        const result = await this.#db.query(sqlRequest, fieldValues);
        const userId = user.id;
        user = this.getUserById(userId);
        return user;
    }

    async changePasswordHash(email, encryptedPassword) {
        // remet le compte à l'état actif (state=1) au cas où il ait été verrouillé
        const sqlRequest = `UPDATE users SET password = ?, state = ? WHERE email = ?`;
        await this.#db.query(sqlRequest, [ encryptedPassword, AccountState.ACTIVE, email]);
    }


    async encryptPassword(password) {
        assert (password !== undefined);
        if (password === undefined)
            return;
        return await bcrypt.hash(password, this.#hashSalt);
    }


    async encryptPasswordIfPresent(user) {
        assert (user !== undefined);
        if (user.password === undefined)
            return;
        user.password = await this.encryptPassword(user.password); 
    }


    async checkPassword(userId, password) {
        if (userId === undefined)
            throw new Error('Argument <password> required');
        if (typeof(userId) !== 'number')
            throw new Error('Argument <userId> is not a number');
        if (password === undefined)
            throw new Error('Argument <password> required');
        if (typeof(password) !== 'string')
            throw new Error('Argument <password> is not a string');
        let sql = `SELECT password FROM users WHERE id = ?`;
        const result = await this.#db.query(sql, [userId]);
        if (result.length === 0)
            throw new Error('User not found');
        const hashedPassword = result[0].password;
        const isValid = await bcrypt.compare(password, hashedPassword);
        return isValid;
    }


    async checkAuthCode(userId, authCode) {
        if (userId === undefined)
            throw new Error('Argument <userId> required');
        if (typeof(userId) !== 'number')
            throw new Error('Argument <userId> is not a number');
        if (authCode === undefined)
            throw new Error('Argument <authCode> required');
        if (typeof(authCode) !== 'number')
            throw new Error('Argument <authCode> is not a number');

        let sql = `SELECT auth_code FROM users WHERE id = ?`;
        const result = await this.#db.query(sql, [userId]);
        if (result.length === 0)
            throw new Error('User not found');
        const userRecord = result[0];
        const validated = (userRecord.auth_code === authCode);
        return validated;
    }

    async deleteUserById(userId){
        assert(userId !== undefined);
        if (typeof(userId) !== 'number')
            throw new Error('Argument <userId> is not a number');
        const sql = `DELETE FROM users WHERE id = ?`;
        const result = await this.#db.query(sql, [userId]);
        return (result.affectedRows !== 0);
    }
}


class UserModelSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate UserModelSingleton!');
    }

    static getInstance() {
        if (! UserModelSingleton.#instance)
            UserModelSingleton.#instance = new UserModel();
        return UserModelSingleton.#instance;
    }
}

export default UserModelSingleton;
