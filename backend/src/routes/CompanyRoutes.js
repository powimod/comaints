'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { requireAdminAuth } from './auth.js'
import { requireUserAuth } from './auth.js'

import { controlObject } from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'

class CompanyRoutes {

    initialize(expressApp) {
	    const model  = ModelSingleton.getInstance()
        
        const companyModel = model.getCompanyModel()

	    expressApp.get('/api/v1/company/list', requireAdminAuth, async (request, response) => {
            const view = request.view
			const companyList = await companyModel.findCompanyList()
            view.json({ companyList })
        })

        expressApp.post('/api/v1/company', requireAdminAuth, async (request, response) => {
            const view = request.view
            try {
                let company = request.body.company
                if (company === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'company'})
                if (typeof(company) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'company'})
                const [ errorMsg, errorParam ] = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)
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
