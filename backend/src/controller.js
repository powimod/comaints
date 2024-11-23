'use strict'

import ModelSingleton from './model.js'
import View from './view.js'
import { ComaintApiErrorInvalidRequest } from '../../common/src/error.mjs'

import AuthRoutesSingleton    from './routes/AuthRoutes.js'
import AccountRoutesSingleton from './routes/AccountRoutes.js'
import CompanyRoutesSingleton from './routes/CompanyRoutes.js'
import AdminRoutesSingleton   from './routes/AdminRoutes.js'
import UserRoutesSingleton    from './routes/UserRoutes.js'
import TokenRoutesSingleton   from './routes/TokenRoutes.js'
import UnitRoutesSingleton    from './routes/UnitRoutes.js'

const API_VERSION = 'v1'

class Controller {

	#authRoutes = null
	#accountRoutes = null
	#adminRoutes = null
	#companyRoutes = null
	#userRoutes = null
	#tokenRoutes = null
	#unitRoutes = null

    async initialize(config, expressApp) {

        // Express middleware to initialize a View instance associated with the request
        expressApp.use( async (request, response, next) => {
            const view = new View(request, response)
            request.view = view
            next()
        })

	    const model  = ModelSingleton.getInstance()

        // IMPORTANT :authRoutes must be initialized first because it has a middleware to handle session cookies
        this.#authRoutes = AuthRoutesSingleton.getInstance()
        this.#authRoutes.initialize(expressApp)

        this.#accountRoutes = AccountRoutesSingleton.getInstance()
        this.#accountRoutes.initialize(expressApp)

        this.#companyRoutes = CompanyRoutesSingleton.getInstance()
        this.#companyRoutes.initialize(expressApp)

        this.#adminRoutes = AdminRoutesSingleton.getInstance()
        this.#adminRoutes.initialize(expressApp)

        this.#userRoutes = UserRoutesSingleton.getInstance()
        this.#userRoutes.initialize(expressApp)

        this.#tokenRoutes = TokenRoutesSingleton.getInstance()
        this.#tokenRoutes.initialize(expressApp)

        this.#unitRoutes = UnitRoutesSingleton.getInstance()
        this.#unitRoutes.initialize(expressApp)


        // special API routes to check i18n support
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
