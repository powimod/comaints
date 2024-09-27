'use strict'

import ViewSingleton from './view.js'

const API_VERSION = 'v1'

class Controller {

    async initialize(config, expressApp) {
	    const view = ViewSingleton.getInstance()

        expressApp.get(`/api/api-version`, (request, response) => {
            view.json(response, { version: API_VERSION })
        })

        expressApp.get(`/api/${API_VERSION}/version`, (request, response) => {
            view.json(response, { version: config.version})
        })

    }

}

class ControllerSingleton {

	constructor() {
		throw new Error('Can not instanciate ControllerSingleton!')
	}

	static getInstance() {
		if (! ControllerSingleton.instance)
			ControllerSingleton.instance = new Controller()
		return ControllerSingleton.instance
	}
}

export default ControllerSingleton
