'use strict'
import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { requireAdminAuth } from './auth.js'
import { requireUserAuth } from './auth.js'

import { controlObject, controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'

class CompanyRoutes {

    initialize(expressApp) {
	    const model  = ModelSingleton.getInstance()
        
        const companyModel = model.getCompanyModel()
        const userModel = model.getUserModel()

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

        expressApp.post('/api/v1/company/initialize', requireUserAuth, async (request, response) => {
            const view = request.view
            try {
                assert(request.userId)
                const userId = request.userId

                if (request.companyId)
                    throw new ComaintApiErrorInvalidRequest('error.company_already_initialized')

                let user = await userModel.getUserById(userId)
                assert(user !== null)
                if (user.companyId)
                    throw new ComaintApiErrorInvalidRequest('error.company_already_initialized')

                let companyName = request.body.companyName
                if (companyName === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'companyName'})
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(companyObjectDef, 'name', companyName)
                if (errorMsg1)
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)

                // TODO control companyId is not already set

                // TODO check user company ID is not already set
                let company = {
                    managerId: request.userId,
                    name: companyName
                }
			    company = await companyModel.createCompany(company)

                user.companyId = company.id
                user = await userModel.editUser(user)



                // TODO regenerate tokens with companyId set
                view.json(company)
            }
            catch(error) {
                console.log(error)
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
