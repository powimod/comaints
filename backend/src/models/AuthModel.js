'se strict'

import assert from 'assert' 
import ModelSingleton from '../model.js'
import { ComaintTranslatedError } from '../../../common/src/error.mjs'
import jwt from 'jsonwebtoken'

import { sendMail } from '../util.js'

class AuthModel {
    #db = null
    #userModel = null
    #tokenSecret = null
    #tokenHashSalt = null
    #refreshTokenLifespan = null
    #accessTokenLifespan = null
    #mailServerConfig = null

    initialize (db, securityConfig, mailServerConfig) {

        // check «security» configuration section 
        const securityParameterNames = [ 'token_secret', 'refresh_token_lifespan' , 'access_token_lifespan']
        for (const parameterName of securityParameterNames ) {
            if (securityConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined is security configuration`)
        }

        assert(securityConfig.token_secret !== undefined)
        this.#tokenSecret = securityConfig.tokenSecret
        this.#tokenHashSalt =  securityConfig.tokenHashSalt
        this.#refreshTokenLifespan = securityConfig.refreshTokenLifespan
        this.#accessTokenLifespan = securityConfig.refreshTokenLifespan

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
    }

    generateValidationCode() {
        const minimum = 10000;
        const maximum = 99999;
        return parseInt(Math.random() * (maximum - minimum) + minimum);
    }

    async register(email, password, validationCode) {
        const user = await this.#userModel.createUser({email, password, validationCode})
        return { user }
    }

    async generateAccessToken(userId, companyId) {
        assert(userId !== undefined)
        assert(companyId !== undefined)
        const payload = {
            company_id: companyId,
            user_id: userId,
            type: 'access',
        };
        return jwt.sign(payload, this.#tokenSecret, { 
            expiresIn: `${this.#accessTokenLifespan}s` // seconds
        });
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
