'use strict'

import assert from 'assert'
import ModelSingleton from '../model.js'
import { ComaintApiError, ComaintApiErrorUnauthorized, ComaintApiErrorInvalidToken } from '../../../common/src/error.mjs'
import jwt from 'jsonwebtoken'

import { sendMail } from '../util.js'

class AccountModel {
    #db = null
    #userModel = null

    initialize (db, securityConfig, mailServerConfig) {
        this.#db = db
        const model  = ModelSingleton.getInstance()
        this.#userModel = model.getUserModel()
    }

    async getUserProfile(userId) {
        return await this.#userModel.getUserById(userId)
    }

}


class AccountModelSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate AccountModelSingleton!')
    }

    static getInstance() {
        if (! AccountModelSingleton.#instance)
            AccountModelSingleton.#instance = new AccountModel()
        return AccountModelSingleton.#instance
    }
}

export default AccountModelSingleton
