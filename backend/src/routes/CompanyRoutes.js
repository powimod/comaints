'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'

import { controlObject } from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'

class CompanyRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
	    const model  = ModelSingleton.getInstance()
        
        const companyModel = model.getCompanyModel()

        // TODO ajouter withAuth
	    expressApp.get('/api/v1/company/list', async (request, response) => {
            const view = new View(request, response)
			const companyList = await companyModel.findCompanyList()
            view.json({ companyList })
        })

        // TODO ajouter withAuth
        expressApp.post('/api/v1/company', async (request, response) => {
            const view = new View(request, response)
            try {
                let company = request.body.company
                if (company === undefined)
                    throw new ComaintApiErrorInvalidRequest(view.translation('error.request_param_not_found', { parameter: 'company'}))
                if (typeof(company) !== 'object')
                    throw new ComaintApiErrorInvalidRequest(view.translation('error.request_param_invalid', { parameter: 'company'}))
                const [ errorMsg, errorParam ] = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(view.translation(errorMsg, errorParam))
			    company = await companyModel.createCompany(company)
                view.json(company)
            }
            catch(error) {
                view.error(error)
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
