'use strict'
import assert from 'assert'

import ModelSingleton from '../model.js'
import { requireUserAuth, checkPagination  } from './middleware.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { controlObject } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'


class UnitRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()
        
        const unitModel = model.getUnitModel()

        expressApp.get('/api/v1/unit/list', requireUserAuth, checkPagination, async (request) => {
            const view = request.view
            try {
                const result = await unitModel.findUnitList(null, null, request.pagination)
                view.json(result)
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })

        expressApp.post('/api/v1/unit/search', requireUserAuth, checkPagination,  async (request) => {
            const view = request.view
            try {
                let properties = request.body.properties || null
                if (properties !== null && ! (properties instanceof Array))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'properties'})
                let filters = request.body.filters || {}
                if (typeof(filters) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'filters'})

                // return only units of user company !
                assert(request.companyId)
                filters.companyId = request.companyId

                const result = await unitModel.findUnitList(properties, filters, request.pagination)
                view.json(result)
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })


        expressApp.post('/api/v1/unit', requireUserAuth, async (request) => {
            const view = request.view
            try {
                assert(request.userId)
                assert(request.companyId)
                let unit = request.body.unit
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'unit'})
                if (typeof(unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'unit'})
                unit.companyId = request.companyId
                const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                unit = await unitModel.createUnit(unit)
                view.json({unit})
            }
            catch(error) {
                view.error(error)
            }
        })
    }

}

class UnitRoutesSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate UnitRoutesSingleton!')
    }

    static getInstance() {
        if (! UnitRoutesSingleton.#instance)
            UnitRoutesSingleton.#instance = new UnitRoutes()
        return UnitRoutesSingleton.#instance
    }
}

export default UnitRoutesSingleton 
