'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs'
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'

class AdminRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()

        const userModel = model.getUserModel()

        expressApp.get('/api/v1/admin/check-access', requireAdminAuth, async (request, response) => {
            const view = request.view
            try {
                view.json({ message: "This is an administrator account"})
            }
            catch(error) {
                view.error(error)
            }
        })

    }
}

class AdminRoutesSingleton {
    static #instance = null

    constructor() {
        throw new Error('Can not instanciate AdminRoutesSingleton!')
    }

    static getInstance() {
        if (! AdminRoutesSingleton.#instance)
            AdminRoutesSingleton.#instance = new AdminRoutes()
        return AdminRoutesSingleton.#instance
    }
}

const requireAdminAuth = (request, response, next) => {
    const view = request.view
    assert(view !== undefined)
    const userId = request.userId
    const connected = request.userConnected
    const administrator = request.isAdministrator
    assert(userId !== undefined)
    assert(connected !== undefined)
    assert(administrator !== undefined)
    console.log(`require admin auth, userId:${userId}, connected:${connected}, administrator:${administrator}`)
    if (userId === null || connected !== true || administrator !== true) {
        view.error(new ComaintApiErrorUnauthorized(view.translation('error.unauthorized_access')))
        return
    }
    next()
}

export { requireAdminAuth }
export default AdminRoutesSingleton
