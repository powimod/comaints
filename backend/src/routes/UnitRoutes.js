'use strict'
import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { requireUserAuth } from './auth.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { controlObject } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'

const defaultPropertyList = [ 'id', 'name' ]

class UnitRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()
        
        const unitModel = model.getUnitModel()

        expressApp.get('/api/v1/unit/list', requireUserAuth, async (request, response) => {
            const view = request.view
            try {
                const unitList = await unitModel.findUnitList(defaultPropertyList, null)
                view.json({ unitList })
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })

        expressApp.post('/api/v1/unit/search', requireUserAuth, async (request, response) => {
            const view = request.view
            try {
                let properties = request.body.properties || defaultPropertyList
                if (properties !== null && ! (properties instanceof Array))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'properties'})
                let filters = request.body.filters || null 
                if (filters !== null && typeof(filters) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'filters'})
                const unitList = await unitModel.findUnitList(properties, filters)
                view.json({ unitList })
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })


        expressApp.post('/api/v1/unit', requireUserAuth, async (request, response) => {
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
