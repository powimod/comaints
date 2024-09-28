'use strict'

import ViewSingleton from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'

class CompanyRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
	    const view = ViewSingleton.getInstance()
	    const model  = ModelSingleton.getInstance()
        
        const companyModel = model.getCompanyModel()

        // TODO ajouter withAuth
	    expressApp.get('/api/v1/company/list', async (request, response) => {
			const companyList = await companyModel.findCompanyList();
            view.json(response, { companyList })
        })

    }

}

class CompanyRoutesSingleton {

    static #instance = null

	constructor() {
		throw new Error('Can not instanciate CompanyRoutesSingleton!')
	}

	static getInstance() {
		if (! CompanyRoutesSingleton.#instance)
			CompanyRoutesSingleton.#instance = new CompanyRoutes()
		return CompanyRoutesSingleton.#instance
	}
}

export default CompanyRoutesSingleton 
