'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'


class AuthRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
	    const model  = ModelSingleton.getInstance()
        
        const authModel = model.getAuthModel()
    }
}

class AuthRoutesSingleton {

    static #instance = null

	constructor() {
		throw new Error('Can not instanciate AuthRoutesSingleton!')
	}

	static getInstance() {
		if (! AuthRoutesSingleton.#instance)
			AuthRoutesSingleton.#instance = new AuthRoutes()
		return AuthRoutesSingleton.#instance
	}
}

export default AuthRoutesSingleton 
