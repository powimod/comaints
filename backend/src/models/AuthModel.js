'se strict'

import assert from 'assert' 
import ModelSingleton from '../model.js'
import { ComaintTranslatedError } from '../../../common/src/error.mjs'
import jwt from 'jsonwebtoken'

class AuthModel {
    #db = null
    #userModel = null
    #tokenSecret = null
    #tokenHashSalt = null
    #refreshTokenLifespan = null
    #accessTokenLifespan = null
    

    initialize (db, config) {

        // check «security» configuration section 
        const securityParameterNames = [ 'token_secret', 'refresh_token_lifespan' , 'access_token_lifespan']
        for (const parameterName of securityParameterNames ) {
            if (config[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`)
        }

        assert(config.token_secret !== undefined)
        this.#tokenSecret = config.tokenSecret
        this.#tokenHashSalt =  config.tokenHashSalt
        this.#refreshTokenLifespan = config.refreshTokenLifespan
        this.#accessTokenLifespan = config.refreshTokenLifespan
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
