'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'

import { controlObject } from '../../../common/src/objects/object-util.mjs'
import tokenObjectDef from '../../../common/src/objects/token-object-def.mjs'

class TokenRoutes {

    initialize(expressApp) {
	    const model  = ModelSingleton.getInstance()
        
        const tokenModel = model.getTokenModel()

        // TODO ajouter withAuth
	    expressApp.get('/api/v1/token/list', async (request, response) => {
            const view = request.view
			const tokenList = await tokenModel.findTokenList()
            view.json({ tokenList })
        })

        // TODO ajouter withAuth
        expressApp.post('/api/v1/token', async (request, response) => {
            const view = request.view
            try {
                let token = request.body.token
                if (token === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'token'})
                if (typeof(token) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'token'})
                const [ errorMsg, errorParam ] = controlObject(tokenObjectDef, token, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)
			    token = await tokenModel.createToken(token)
                view.json(token)
            }
            catch(error) {
                view.error(error)
            }
        })
    }

}

class TokenRoutesSingleton {

    static #instance = null

	constructor() {
		throw new Error('Can not instanciate TokenRoutesSingleton!')
	}

	static getInstance() {
		if (! TokenRoutesSingleton.#instance)
			TokenRoutesSingleton.#instance = new TokenRoutes()
		return TokenRoutesSingleton.#instance
	}
}

export default TokenRoutesSingleton 
