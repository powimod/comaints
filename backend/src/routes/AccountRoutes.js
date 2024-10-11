'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { requireUserAuth } from './AuthRoutes.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'


class AccountRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
        const model  = ModelSingleton.getInstance()

        const accountModel = model.getAccountModel()

        expressApp.get('/api/v1/account/profile', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                const user = await accountModel.getUserProfile(userId)
                view.json({ user })
            }
            catch(error) {
                view.error(error)
            }
        })

    }
}

class AccountRoutesSingleton {
    static #instance = null

    constructor() {
        throw new Error('Can not instanciate AccountRoutesSingleton!')
    }

    static getInstance() {
        if (! AccountRoutesSingleton.#instance)
            AccountRoutesSingleton.#instance = new AccountRoutes()
        return AccountRoutesSingleton.#instance
    }
}

export default AccountRoutesSingleton
