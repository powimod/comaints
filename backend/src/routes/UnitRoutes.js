'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'

import { controlObject } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'

class UnitRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()
        
        const unitModel = model.getUnitModel()

        // TODO ajouter withAuth
        expressApp.get('/api/v1/unit/list', async (request, response) => {
            const view = request.view
            const unitList = await unitModel.findUnitList()
            view.json({ unitList })
        })

        // TODO ajouter withAuth
        expressApp.post('/api/v1/unit', async (request, response) => {
            const view = request.view
            try {
                let unit = request.body.unit
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'unit'})
                if (typeof(unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'unit'})
                const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                unit = await unitModel.createUnit(unit)
                view.json(unit)
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
