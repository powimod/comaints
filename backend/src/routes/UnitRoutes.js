'initializeuse strict'
import assert from 'assert'

import ModelSingleton from '../model.js'
import { requireUserAuth, requestPagination, requestFilters, requestProperties } from './middleware.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { controlObject } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'


class UnitRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()
        
        const unitModel = model.getUnitModel()

        expressApp.get('/api/v1/unit/list', requireUserAuth, requestProperties, requestPagination, async (request) => {
            const view = request.view
            const properties = request.requestProperties
            assert(properties !== undefined)
            const pagination = request.requestPagination
            assert(pagination !== undefined)

            assert(request.companyId)
            const filters = { companyId: request.companyId }

            try {
                const result = await unitModel.findUnitList(properties, filters, pagination)
                view.json(result)
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })

        expressApp.post('/api/v1/unit/search', requireUserAuth, requestProperties, requestFilters, requestPagination,  async (request) => {
            const view = request.view
            const properties = request.requestProperties
            assert(properties !== undefined)
            const filters = request.requestFilters
            assert(filters !== undefined)
            const pagination = request.requestPagination
            assert(pagination !== undefined)
            try {
                // return only units of user company !
                assert(request.companyId)
                filters.companyId = request.companyId

                const result = await unitModel.findUnitList(properties, filters, pagination)
                view.json(result)
            }
            catch(error) {
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
                console.log(error)
                view.error(error)
            }
        })

        expressApp.get('/api/v1/unit/:id', requireUserAuth, async (request) => {
            const unitId = request.params.id
            const view = request.view
            try {
                assert(request.userId)
                assert(request.companyId)
                const unit = await unitModel.getUnitById(unitId)
                view.json({unit})
            }
            catch(error) {
                console.log(error)
                view.error(error)
            }
        })

        expressApp.post('/api/v1/unit/:id', requireUserAuth, async (request) => {
            assert(request.userId)
            assert(request.companyId)
            const view = request.view

            try {
                let unitId = request.params.id
                console.log('dOm unitId',  unitId)
                if (isNaN(unitId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'id'})
                unitId = parseInt(unitId)

                let unit = request.body.unit
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'unit'})
                if (typeof(unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'unit'})

                console.log('dOm =======> A')
                if (unit.id !== unitId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', { object: 'unit', id: 'id'})
                console.log('dOm =======> B')

                if (unit.companyId !== request.companyId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', { object: 'unit', id: 'companyid'})
                console.log('dOm =======> C')

                const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                unit = await unitModel.editUnit(unit)
                view.json({unit})
            }
            catch(error) {
                console.log(error)
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
