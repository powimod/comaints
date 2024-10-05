'use strict'

import { buildFieldArrays, controlObject, convertObjectFromDb } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'
import { comaintErrors, buildComaintError } from '../../../common/src/error.mjs'

class UserModel {
    #db = null

    initialize (db) {
        this.#db = db
    }

    async findUserList() {
        let sql = `SELECT * FROM users`
        const result = await this.#db.query(sql)
        if (result.code)
            throw new Error(result.code)
        const userList = []
        for (let userRecord of result)
            userList.push(userRecord)
        return userList;
    }


    async getUserById(userId) {
        if (userId === undefined)
            throw new Error('Argument <userId> required');
        if (isNaN(userId))
            throw new Error('Argument <userId> is not a number');
        let sql = `SELECT * FROM users WHERE id = ?`;
        const result = await this.#db.query(sql, [userId]);
        if (result.code)
            throw new Error(result.code);
        if (result.length === 0)
            return null;
        const user = result[0]
        // TODO filter properties
        return user;
    }


    async createUser(user) {
        user.accountLocked = true
        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, user)
        const markArray = Array(fieldValues.length).fill('?').join(',')
        const sqlRequest = `
            INSERT INTO users(${fieldNames.join(', ')}) VALUES (${markArray});
        `
        try {
            const result = await this.#db.query(sqlRequest, fieldValues)
            const userId = result.insertId
            const dbUser = await this.getUserById(userId)
            user = convertObjectFromDb(userObjectDef, dbUser)
            return user
        }
        catch (error) {
            // TODO duplicated code
            if (error.code === 'ER_DUP_ENTRY') {
                const match = error.message.match(/Duplicate entry '.*' for key '(\w+)'/)
                if (match) {
                    let field = match[1]
                    if (field.startsWith("idx_"))
                        field = field.slice(4)
                    error = buildComaintError(comaintErrors.CONFLICT_ERROR, {field, object: 'user'})
                }
            }
            throw error
        }
    }
}


class UserModelSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate UserModelSingleton!')
    }

    static getInstance() {
        if (! UserModelSingleton.#instance)
            UserModelSingleton.#instance = new UserModel()
        return UserModelSingleton.#instance
    }
}

export default UserModelSingleton
