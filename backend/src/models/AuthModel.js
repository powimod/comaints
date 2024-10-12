'use strict'

import assert from 'assert'
import jwt from 'jsonwebtoken'

import ModelSingleton from '../model.js'
import { ComaintApiError, ComaintApiErrorUnauthorized, ComaintApiErrorInvalidToken } from '../../../common/src/error.mjs'
import MailManagerSingleton from '../MailManager.js'

class AuthModel {
    #db = null
    #userModel = null
    #tokenModel = null
    #tokenSecret = null
    #tokenHashSalt = null
    #refreshTokenLifespan = null
    #accessTokenLifespan = null

    initialize (db, securityConfig) {
        assert(db !== undefined)
        assert(securityConfig !== undefined)

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

        this.#db = db
        const model  = ModelSingleton.getInstance()
        this.#userModel = model.getUserModel()
        this.#tokenModel = model.getTokenModel()
    }

    generateAuthCode() {
        const minimum = 10000
        const maximum = 99999
        return parseInt(Math.random() * (maximum - minimum) + minimum)
    }


    async register(email, password, authCode) {
        const user = await this.#userModel.createUser({email, password, authCode})
        return { user }
    }


    async validateRegistration(userId, authCode) {

        const validated = await this.#userModel.checkAuthCode(userId, authCode)
        if (! validated)
            return false

        let user = await this.#userModel.getUserById(userId)
        if (user === null)
            throw new Error('User not found')
        if (! user.accountLocked)
            throw new ComaintApiError('error.account_not_locked')

        // unlock User account and reset validation code
        user.accountLocked = false
        user.authCode = 0
        delete user.password // do not re-encrypt already encrypted password !
        await this.#userModel.editUser(user)
        return true
    }

    async sendRegisterAuthCode(code, email, i18n_t) {
        assert(code !== undefined)
        assert(typeof(code) === 'number')
        assert(email !== undefined)
        assert(typeof(email) === 'string')
        assert(i18n_t !== undefined)
        assert(typeof(i18n_t) === 'function')
        const subject = i18n_t('register.mail_title')
        const textBody = i18n_t('register.mail_body', { 'code' : code })
        const htmlBody = i18n_t('register.mail_body', { 'code' : `<b>${code}</b>code` })
        const mailManger = MailManagerSingleton.getInstance()
        return await mailManager.sendMail(
                email,
                subject,
                textBody,
                htmlBody
        )
    }

    generateAccessToken(userId, companyId, refreshTokenId, connected) {
        assert(userId !== undefined)
        assert(companyId !== undefined)
        assert(refreshTokenId !== undefined)
        assert(connected !== undefined)
        assert(this.#tokenSecret !== undefined)
        assert(this.#accessTokenLifespan !== undefined)
        const payload = {
            type: 'access',
            user_id: userId,
            company_id: companyId,
            connected: connected,
            refresh_token_id: refreshTokenId
        }
        return jwt.sign(payload, this.#tokenSecret, {
            expiresIn: `${this.#accessTokenLifespan}s` // seconds
        })
    }


    checkAccessToken(token, expiredAccessTokenEmulation = false) {
        const expiredTokenErrorMessage = "Expired access token"
        const decodeAccessTokenPromise = new Promise( (resolve, reject) => {
            if (expiredAccessTokenEmulation){
                reject(expiredTokenErrorMessage)
                return
            }
            jwt.verify(token, this.#tokenSecret, (err, payload) => {
                if (err !== null)  {
                    if (err.constructor.name === 'TokenExpiredError')
                        reject(expiredTokenErrorMessage)
                    else
                        reject('Invalid token')
                    return
                }
                if (payload.type !== 'access') {
                    reject('Not an access token')
                    return
                }
                const userId = payload.user_id
                if (isNaN(userId)) {
                    reject(`Invalid token content`)
                    return
                }
                const companyId = payload.company_id
                if (isNaN(companyId )) {
                    reject(`Invalid token content`)
                    return
                }
                const refreshTokenId = payload.refresh_token_id
                if (isNaN(refreshTokenId )) {
                    reject(`Invalid token content`)
                    return
                }
                const connected = payload.connected
                if (connected !== true && connected !== false) {
                    reject(`Invalid token content`)
                    return
                }
                resolve([userId, companyId, refreshTokenId, connected ])
            })
        })
        return decodeAccessTokenPromise
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
        const jwtToken = jwt.sign(payload, this.#tokenSecret, { expiresIn: `${refreshTokenLifespan}days` })
        return [ jwtToken, tokenId ]
    }

    async checkRefreshToken(token, expiredRefreshTokenEmulation = false) {
        const expiredTokenErrorMessage = "Expired refresh token"
        const decodeRefreshTokenPromise = new Promise( (resolve, reject) => {
            if (expiredRefreshTokenEmulation){
                reject(expiredTokenErrorMessage)
                return
            }
            jwt.verify(token, this.#tokenSecret, (err, payload) => {
                if (err !== null)  {
                    if (err.constructor.name === 'TokenExpiredError')
                        reject(expiredTokenErrorMessage)
                    else
                        reject('Invalid tOken')
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

        let tokenId, userId, companyId
        try {
            [tokenId, userId, companyId] = await decodeRefreshTokenPromise
        }
        catch(error) {
            throw new ComaintApiErrorInvalidToken()
        }

        assert(tokenId !== undefined)
        assert(userId !== undefined)
        assert(companyId !== undefined)

        // token must be present in database to be valid (detect token usurpation)
        token = await this.#tokenModel.getTokenById(tokenId)
        const tokenFound = (token !== null)

        return [tokenFound, tokenId, userId, companyId]
    }


	async lockAccount(userId) {
		assert(this.#userModel !== null)
        await this.#userModel.editUser({
            id: userId,
            accountLocked: true
        })
	}

    async isAccountLocked(userId) {
		assert(this.#userModel !== null)
        const user = await this.#userModel.getUserById(userId)
        return user.accountLocked
    }
    

	async deleteRefreshToken(tokenId) {
		assert(this.#tokenModel !== null)
        await this.#tokenModel.deleteTokenById(tokenId)
	}


    async getUserProfile(userId) {
        return await this.#userModel.getUserById(userId)
    }

    async login(email, password) {
        const user = await this.#userModel.getUserByEmail(email)
        if (user === null)
            throw new ComaintApiErrorUnauthorized('error.invalid_email_or_password')
        const isPasswordValid = await this.#userModel.checkPassword(user.id, password)
        if (! isPasswordValid)
            throw new ComaintApiErrorUnauthorized('error.invalid_email_or_password')
        // TODO check account is not locked
        if (! user.active ) // FIXME active ou locked ?
            throw new Error("Your account is locked") // FIXME translation
        return user
    }

    async logout(userId, refreshTokenId) {
        assert(userId !== undefined)
        assert(refreshTokenId !== undefined)
        // userId is not used
        // let user = await this.#userModel.getUserById(userId)
        await this.#tokenModel.deleteTokenById(refreshTokenId)
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
