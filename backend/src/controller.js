'use strict'

import ViewSingleton from './view.js'
import ModelSingleton from './model.js'
import View from './view.js'
import { ComaintApiErrorInvalidRequest } from '../../common/src/error.mjs'

// TODO clean import {buildCompanyRoutes} from './routes/CompanyRoutes.js'
import CompanyRoutesSingleton from './routes/CompanyRoutes.js'

const API_VERSION = 'v1'

class Controller {

	#companyRoutes = null;

    async initialize(config, expressApp) {
	    const model  = ModelSingleton.getInstance()


        // special API route to check i18n support
        expressApp.get(`/api/welcome`, (request, response) => {
            const view = new View(request, response)
            view.json({
                response: view.translation('general.welcome')
            })
        })
        expressApp.post(`/api/welcome`, (request, response) => {
            const view = new View(request, response)
            try {
                const firstname = request.body.firstname
                if (firstname === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'firstname'})
                if (typeof(firstname) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'firstname'})
                const lastname = request.body.lastname
                view.json({
                    response: view.translation('general.hello', { firstname, lastname })
                })
            }
            catch(error) {
                view.error(error)
            }
        })


        expressApp.get(`/api/version`, (request, response) => {
            const view = new View(request, response)
            view.json({ version: API_VERSION })
        })

        expressApp.get(`/api/${API_VERSION}/backend-version`, (request, response) => {
            const view = new View(request, response)
            view.json({ version: config.version})
        })

        expressApp.post(`/api/${API_VERSION}/check-database`, async (request, response) => {
            const view = new View(request, response)
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
            view.json({ success, message })
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
