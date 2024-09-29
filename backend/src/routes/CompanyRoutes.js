'use strict'

import ViewSingleton from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintErrorInvalidRequest } from '../../../common/src/error.mjs'

class CompanyRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
	    const view = ViewSingleton.getInstance()
	    const model  = ModelSingleton.getInstance()
        
        const companyModel = model.getCompanyModel()

        // TODO ajouter withAuth
	    expressApp.get('/api/v1/company/list', async (request, response) => {
			const companyList = await companyModel.findCompanyList()
            view.json(response, { companyList })
        })

        // TODO ajouter withAuth
        expressApp.post('/api/v1/company', async (request, response) => {
            try {
                let company = request.body.company;
                if (company === undefined)
                    throw new ComaintErrorInvalidRequest(`Can't find «company» in request body`);
			    company = await companyModel.createCompany(company);
                view.json(response, company)
            }
            catch(error) {
                view.error(response, error)
            }
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
