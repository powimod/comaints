'use strict'

import { convertObjectToDb, buildFieldArrays, controlObject } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'

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
        const userDb = convertObjectToDb(userObjectDef, user)
        const [ fieldNames, fieldValues ] = buildFieldArrays(userObjectDef, userDb)
        const markArray = Array(fieldValues.length).fill('?').join(',')
        const sqlRequest = `
            INSERT INTO users(${fieldNames.join(', ')}) VALUES (${markArray});
        `
        const result = await this.#db.query(sqlRequest, fieldValues)
        if (result.code)
            throw new Error(result.code)
        const userId = result.insertId
        user = await this.getUserById(userId)
        // TODO generate ComaintApiErrorConflict 
        return user
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
