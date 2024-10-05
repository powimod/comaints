'use strict'

import assert from 'assert'
import bcrypt from 'bcrypt'

import { buildFieldArrays, controlObject, convertObjectFromDb } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'
import { comaintErrors, buildComaintError } from '../../../common/src/error.mjs'

class UserModel {
    #db = null
    #hashSalt = null

    initialize (db, hashSalt) {
        assert (db !== undefined)
        assert (hashSalt !== undefined)
        this.#db = db
        this.#hashSalt = parseInt(hashSalt)
    }

    async findUserList() {
        let sql = `SELECT * FROM users`
        const result = await this.#db.query(sql)
        if (result.code)
            throw new Error(result.code)
        const userList = []
        for (let userRecord of result) {
            const user = convertObjectFromDb(userObjectDef, userRecord)
            userList.push(user)
        }
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

		if (user.password === undefined || user.password === null)
			throw new Error('User password missing')
		await this.encryptPasswordIfPresent(user)

        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, user)
        const markArray = Array(fieldValues.length).fill('?').join(',')
        const sqlRequest = `
            INSERT INTO users(${fieldNames.join(', ')}) VALUES (${markArray});
        `
        try {
            const result = await this.#db.query(sqlRequest, fieldValues)
            const userId = result.insertId
            const userRecord = await this.getUserById(userId)
            user = convertObjectFromDb(userObjectDef, userRecord)
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

	async encryptPasswordIfPresent(user) {
		assert (user !== undefined)
		if (user.password === undefined)
			return
		user.password = await bcrypt.hash(user.password, this.#hashSalt)
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
