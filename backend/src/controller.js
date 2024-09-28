'use strict'

import ViewSingleton from './view.js'
import ModelSingleton from './model.js'

// TODO clean import {buildCompanyRoutes} from './routes/CompanyRoutes.js'
import CompanyRoutesSingleton from './routes/CompanyRoutes.js'

const API_VERSION = 'v1'

class Controller {

	#companyRoutes = null;

    async initialize(config, expressApp) {
	    const model  = ModelSingleton.getInstance()
	    const view = ViewSingleton.getInstance()

        expressApp.get(`/api/version`, (request, response) => {
            view.json(response, { version: API_VERSION })
        })

        expressApp.get(`/api/${API_VERSION}/backend-version`, (request, response) => {
            view.json(response, { version: config.version})
        })

        expressApp.post(`/api/${API_VERSION}/check-database`, async (request, response) => {
            let success = false
            let message = null
            try {
                await model.checkAccess()
                success = true
                message = 'Success'
            }
            catch (error) {
                message = error.message
            }
            view.json(response, { success, message })
        })

        // TODO cleanup this.#companyRoutes = buildCompanyRoutes(config, expressApp)
        this.#companyRoutes = CompanyRoutesSingleton.getInstance()
        this.#companyRoutes.initialize(config, expressApp)
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
