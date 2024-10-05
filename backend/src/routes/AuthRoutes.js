'use strict'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'


class AuthRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
	    const model  = ModelSingleton.getInstance()
        
        const authModel = model.getAuthModel()

        // public route 
        expressApp.post('/api/v1/auth/register', async (request, response) => {
            const view = new View(request, response)
            try {
                let email = request.body.email
                if (email === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'email'})
                if (typeof(email) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'email'})
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email) 
                if (errorMsg1) 
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)


                let password = request.body.password
                if (password === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'password'})
                if (typeof(password) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'password'})
                // FIXME strange error «Cannot set properties of undefined (setting 'undefined')»
                // let errorMsg, errorParam
                // First call :
                //      [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'password', password) 
                //      => no error
                // Second call :
                //      [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'password', password) 
                //      => Error «Cannot set properties of undefined (setting 'undefined')»
                const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', password) 
                if (errorMsg2) 
                    throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2)

                // make a random validation code which will be sent by email to unlock account
                const validationCode = authModel.generateValidationCode();
                console.log(`Validation code is ${ validationCode }`); // TODO remove this

                const result = await authModel.register(email, password, validationCode)

                // FIXME validation code should be secret
                delete result.user['validationCode']
                if (result.validationCode)
                    throw new Error('User object should not have a validation code property')
                if (result.password)
                    throw new Error('User object should not have a password property')
                if (result.administrator)
                    throw new Error('User object should not be administrator')

                view.json(result)
            }
            catch(error) {
                view.error(error)
            }
        })

    }
}

class AuthRoutesSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate AuthRoutesSingleton!')
    }

    static getInstance() {
        if (! AuthRoutesSingleton.#instance)
            AuthRoutesSingleton.#instance = new AuthRoutes()
        return AuthRoutesSingleton.#instance
    }
}

export default AuthRoutesSingleton 
