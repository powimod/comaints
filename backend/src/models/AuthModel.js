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
        // filter fields
        let user = await this.#userModel.getUserById(userId)
        if (user === null)
            throw new Error('Unknown User Id'); // FIXME translation
        if (validationCode !== user.validationCode)
            throw new Error('Invalid code'); // FIXME translation
        if (! user.accountLocked)
            throw new ComaintTranslatedError('error.account_not_locked')

        // unlock User account and reset validation code
        user.accountLocked = false
        user.validationCode = 0
        delete user.password // do not re-encrypt already encrypted password !
        await this.#userModel.editUser(user)
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
