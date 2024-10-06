'use strict'

import assert from 'assert'
import ModelSingleton from '../model.js'
import { ComaintTranslatedError } from '../../../common/src/error.mjs'
import jwt from 'jsonwebtoken'

import { sendMail } from '../util.js'

class AuthModel {
    #db = null
    #userModel = null
    #tokenModel = null
    #tokenSecret = null
    #tokenHashSalt = null
    #refreshTokenLifespan = null
    #accessTokenLifespan = null
    #mailServerConfig = null

    initialize (db, securityConfig, mailServerConfig) {

        // check «security» configuration section
        const securityParameterNames = [ 'tokenSecret', 'refreshTokenLifespan' , 'accessTokenLifespan']
        for (const parameterName of securityParameterNames ) {
            if (securityConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined is security configuration`)
        }

        this.#tokenSecret = securityConfig.tokenSecret
        this.#tokenHashSalt =  securityConfig.tokenHashSalt
        this.#refreshTokenLifespan = securityConfig.refreshTokenLifespan
        this.#accessTokenLifespan = securityConfig.accessTokenLifespan

        // check «mailServer» configuration section
        const mailServerParameterNames = [ 'host', 'port', 'user', 'password', 'from']
        for (const parameterName of mailServerParameterNames ) {
            if (mailServerConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined in mail server configuration`)
        }
        this.#mailServerConfig = mailServerConfig

        this.#db = db
        const model  = ModelSingleton.getInstance()
        this.#userModel = model.getUserModel()
        this.#tokenModel = model.getTokenModel()
    }

    generateValidationCode() {
        const minimum = 10000
        const maximum = 99999
        return parseInt(Math.random() * (maximum - minimum) + minimum)
    }

    async register(email, password, validationCode) {
        const user = await this.#userModel.createUser({email, password, validationCode})
        return { user }
    }


    async validateRegistration(userId, validationCode) {

        const validated = await this.#userModel.checkValidationCode(userId, validationCode)
        if (! validated)
            return false

        // filter fields
        let user = await this.#userModel.getUserById(userId)
        if (user === null)
            throw new Error('User not found')
        if (! user.accountLocked)
            throw new ComaintTranslatedError('error.account_not_locked')

        // unlock User account and reset validation code
        user.accountLocked = false
        user.validationCode = 0
        delete user.password // do not re-encrypt already encrypted password !
        await this.#userModel.editUser(user)
        return true
    }

    async sendRegisterValidationCode(code, email, i18n_t) {
        assert(code !== undefined)
        assert(typeof(code) === 'number')
        assert(email !== undefined)
        assert(typeof(email) === 'string')
        assert(i18n_t !== undefined)
        assert(typeof(i18n_t) === 'function')
        const subject = i18n_t('register.mail_title')
        const textBody = i18n_t('register.mail_body', { 'code' : code })
        const htmlBody = i18n_t('register.mail_body', { 'code' : `<b>${code}</b>code` })
        return await sendMail(
                email,
                subject,
                textBody,
                htmlBody,
                this.#mailServerConfig
        )
    }

    generateAccessToken(userId, companyId) {
        assert(userId !== undefined)
        assert(companyId !== undefined)
        assert(this.#tokenSecret !== undefined)
        assert(this.#accessTokenLifespan !== undefined)
        const payload = {
            type: 'access',
            user_id: userId,
            company_id: companyId
        }
        return jwt.sign(payload, this.#tokenSecret, {
            expiresIn: `${this.#accessTokenLifespan}s` // seconds
        })
    }


    checkAccessToken(token) {
        const decodeTokenPromise = new Promise( (resolve, reject) => {
            jwt.verify(token, this.#tokenSecret, (err, payload) => {
                if (err !== null)  {
                    if (err.constructor.name === 'TokenExpiredError')
                        reject('Expired token') // DO NOT translate (used by API lib)
                    else
                        reject('Invalid token')
                    return
                }
                if (payload.type !== 'access') {
                    reject('Not an access token')
                    return
                }
                if (isNaN(payload.user_id)) {
                    reject(`Invalid token content`)
                    return
                }
                if (isNaN(payload.company_id)) {
                    reject(`Invalid token content`)
                    return
                }
                resolve([payload.user_id, payload.company_id])
            })
        })
        return decodeTokenPromise
    }


    async generateRefreshToken(userId, companyId) {
        assert(companyId !== undefined)
        assert(this.#tokenSecret !== undefined)
        assert(this.#refreshTokenLifespan !== undefined)

        const refreshTokenLifespan = this.#refreshTokenLifespan
        const expiresAt = new Date (Date.now() + refreshTokenLifespan * 86400000) // 24 hours in ms
        const token = await this.#tokenModel.createToken({ userId, expiresAt })
        const tokenId = token.id

        const payload = {
            type: 'refresh',
            token_id: tokenId,
            user_id: userId,
            company_id: companyId
        }
        return jwt.sign(payload, this.#tokenSecret, { expiresIn: `${refreshTokenLifespan}days` })
    }

    async checkRefreshToken(token) {
        const decodeTokenPromise = new Promise( (resolve, reject) => {
            jwt.verify(token, this.#tokenSecret, (err, payload) => {
                if (err !== null)  {
                    if (err.constructor.name === 'TokenExpiredError')
                        reject('Expired token') // DO NOT translate (used by API lib)
                    else
                        reject('Invalid token')
                    return
                }
                if (payload.type !== 'refresh') {
                    reject('Not an refresh token')
                    return
                }
                if (isNaN(payload.token_id) || isNaN(payload.user_id)) {
                    reject(`Invalid token content`)
                    return
                }
                resolve([payload.token_id, payload.user_id, payload.company_id])
            })
        })
        const [tokenId, userId, companyId] = await decodeTokenPromise

        assert(tokenId !== undefined)
        assert(userId !== undefined)
        assert(companyId !== undefined)

        token = await this.#tokenModel.getTokenById(userId)
        const tokenFound = (token !== null)

        //TODO return extra field
        return [tokenFound, tokenId, userId, companyId]
    }
}


class AuthModelSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate AuthModelSingleton!')
    }

    static getInstance() {
        if (! AuthModelSingleton.#instance)
            AuthModelSingleton.#instance = new AuthModel()
        return AuthModelSingleton.#instance
    }
}

export default AuthModelSingleton
