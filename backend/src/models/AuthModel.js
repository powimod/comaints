'se strict'

import assert from 'assert' 

class AuthModel {
    #db = null
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
    }

    static async generateAccessToken(userId, companyId) {
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
