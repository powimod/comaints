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

    initialize(expressApp) {
        const controller = ControllerSingleton.getInstance()
        const model  = ModelSingleton.getInstance()

        const accountModel = model.getAccountModel()

        expressApp.get('/api/v1/account/profile', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null)
                const user = await accountModel.getUserProfile(userId)
                view.json({ user })
            }
            catch(error) {
                view.error(error)
            }
        })

        // public route
        expressApp.post('/api/v1/account/change-password', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null)
                const user = await accountModel.getUserProfile(userId)
                if (! user)
                    throw new Error('User not found')

                let currentPassword = request.body.currentPassword
                if (currentPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'currentPassword'})
                if (typeof(currentPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'currentPassword'})
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'password', currentPassword)
                if (errorMsg1)
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)

                let newPassword = request.body.newPassword
                if (newPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'newPassword'})
                if (typeof(newPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'newPassword'})
                const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', newPassword)
                if (errorMsg2)
                    throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2)


                const isCurrentPassordValid = await accountModel.checkPassword(userId, currentPassword)
                if (! isCurrentPassordValid )
                    throw new ComaintApiErrorUnauthorized('error.invalid_password')

                await accountModel.changePassword(userId, newPassword)

                // no special info to return (exception thrown when an error occures)
                view.json({message: 'Password changed'})
            }
            catch(error) {
                console.log(error)
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
