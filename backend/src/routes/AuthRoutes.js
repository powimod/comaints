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

                // self-tests does not send validation code by email
                let sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ? request.body.sendCodeByEmail : true

                // make a random validation code which will be sent by email to unlock account
                const validationCode = authModel.generateValidationCode()
                console.log(`Validation code is ${ validationCode }`) // TODO remove this

                const result = await authModel.register(email, password, validationCode)

                const user = result.user
                if (! user)
                    throw new Error('User not found in result')

                if (user.validationCode !== undefined)
                    throw new Error('User object should not have a validation code property')
                if (user.password !== undefined)
                    throw new Error('User object should not have a password property')
                if (user.administrator === true)
                    throw new Error('User object should not be administrator')

                const userId = user.id
                if (! userId)
                    throw new Error('userId not found')

                const companyId = user.companyId
                if (companyId === undefined )
                    throw new Error('companyId not found')
                if (companyId !== null)
                    throw new Error('companyId should be null')


                if (sendCodeByEmail)
                    await authModel.sendRegisterValidationCode(validationCode, email, view.translation)

                // generate access and refresh tokens
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId)
                const newRefreshToken = await authModel.generateRefreshToken(userId, companyId)

                // TODO use newly create access and refresh tokens

                view.json({
                    'access-token': newAccessToken,
                    'refresh-token': newRefreshToken
                })
            }
            catch(error) {
                view.error(error)
            }
        })


        // public route 
        expressApp.post('/api/v1/auth/validateRegistration', async (request, response) => {
            const view = new View(request, response)
            try {
                let code = request.body.code
                if (code === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'code'})
                if (typeof(code) !== 'number')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'code'})
                const [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'validationCode',code) 
                if (errorMsg) 
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)
                /*
                const result = await authModel.validateRegistration((email, password, validationCode)
                view.json(result)
                */
                const result = false // TODO
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
