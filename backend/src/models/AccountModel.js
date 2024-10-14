'use strict'

import assert from 'assert'
import ModelSingleton from '../model.js'
import { ComaintApiError, ComaintApiErrorUnauthorized, ComaintApiErrorInvalidToken } from '../../../common/src/error.mjs'
import jwt from 'jsonwebtoken'

class AccountModel {
    #db = null
    #userModel = null
    #authModel = null

    initialize (db) {
        this.#db = db
        const model  = ModelSingleton.getInstance()
        this.#userModel = model.getUserModel()
        this.#authModel = model.getAuthModel()
    }

    async getUserProfile(userId) {
        return await this.#userModel.getUserById(userId)
    }

    generateAuthCode() {
        return this.#authModel.generateAuthCode()
    }

    sendChangeEmailAuthCode(authCode, originalEmail, newEmail, translation) {
        return this.#authModel.sendChangeEmailAuthCode(authCode, originalEmail, newEmail, translation)
    }

    async checkPassword(userId, password) {
        return await this.#userModel.checkPassword(userId, password)
    }

    async changePassword(userId, password) {
        return await this.#userModel.editUser({ id: userId, password })
    }

    async prepareEmailChange(userId, email) {
        return await this.#authModel.prepareEmailChange(userId, email)
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
