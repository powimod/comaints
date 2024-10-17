'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'

import { controlObject } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'

class UserRoutes {

    initialize(expressApp) {
        const controller = ControllerSingleton.getInstance()
        const model  = ModelSingleton.getInstance()
        
        const userModel = model.getUserModel()

        // TODO ajouter withAuth
        expressApp.get('/api/v1/user/list', async (request, response) => {
            const view = new View(request, response)
            const userList = await userModel.findUserList()
            view.json({ userList })
        })

        // TODO ajouter withAuth
        expressApp.post('/api/v1/user', async (request, response) => {
            const view = new View(request, response)
            try {
                let user = request.body.user
                if (user === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'user'})
                if (typeof(user) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'user'})
                const [ errorMsg, errorParam ] = controlObject(userObjectDef, user, { fullCheck:true, checkId:false })
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                // delete protected properties
                delete user.companyId
                delete user.password
                delete user.state
                delete user.lastUse
                delete user.authAction
                delete user.authData
                delete user.authCode
                delete user.authExpiration
                delete user.authAttempts

                user = await userModel.createUser(user)
                view.json(user)
            }
            catch(error) {
                view.error(error)
            }
        })
    }

}

class UserRoutesSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate UserRoutesSingleton!')
    }

    static getInstance() {
        if (! UserRoutesSingleton.#instance)
            UserRoutesSingleton.#instance = new UserRoutes()
        return UserRoutesSingleton.#instance
    }
}

export default UserRoutesSingleton 
