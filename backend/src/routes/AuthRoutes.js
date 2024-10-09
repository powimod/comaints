'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'


class AuthRoutes {

    initialize(config, expressApp) {
        const controller = ControllerSingleton.getInstance()
        const model  = ModelSingleton.getInstance()

        const authModel = model.getAuthModel()

        // middleware to check access token
        expressApp.use( async (request, response, next) => {
            console.log(`Token middleware : load access token for request ${request.url} ...`)
            assert(authModel !== null)
            let userId = null
            let companyId = null
            let refreshTokenId = null
            let connected = false
            const token = request.headers['x-access-token']
            if (token === undefined) {
                console.log(`Token middleware -> access token absent (anonymous request)`)
            }
            else {
                try {
                    [userId, companyId, refreshTokenId, connected] = await authModel.checkAccessToken(token)
                    console.log(`Token middleware -> userId = ${userId}`)
                    console.log(`Token middleware -> companyId = ${companyId}`)
                    console.log(`Token middleware -> refreshTokenId = ${refreshTokenId}`)
                    console.log(`Token middleware -> connected = ${connected}`)
                }
                catch (error) {
                    console.log(`Token middleware -> error : ${ error.message ? error.message : error }`)
                    // TODO View.sendJsonError(response, error)
                    // TODO add selftest to check invalid token 
                    throw new Error("Invalid token!")
                }
            }
            console.log(`Token middleware : userId=${userId}, companyId=${companyId}, connected=${connected}`)
            request.userId = userId
            request.companyId = companyId
            request.refreshTokenId = refreshTokenId
            request.userConnected = connected
            next()
        })


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

                // access token with userConnected = false
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId , false)

                // TODO use newly create access and refresh tokens

                view.json({
                    'refresh-token': newRefreshToken,
                    'access-token': newAccessToken
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
                // get IDs obtained from HTTP header token
                const userId = request.userId
                if (userId === null)
                    throw new Error('User ID not found in request header')
                const companyId = request.companyId // can be null with newly registered user
                const refreshTokenId = request.refreshTokenId
                assert (refreshTokenId !== null)

                let code = request.body.code
                if (code === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'code'})
                if (typeof(code) !== 'number')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'code'})
                const [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'validationCode',code)
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)
                const validated = await authModel.validateRegistration(userId, code)

                const jsonResponse = { validated, userId } // send userId to make API-Lib detect context change
                if (validated) {
                    // generate a new access token with userConnected = true
                    const newAccessToken  = await authModel.generateAccessToken(userId, companyId, refreshTokenId, true)
                    jsonResponse['access-token'] = newAccessToken
                }

                view.json(jsonResponse)
            }
            catch(error) {
                view.error(error)
            }
        })



        // public route
        expressApp.post('/api/v1/auth/login', async (request, response) => {
            const view = new View(request, response)
            try {
                if (request.userId !== null)
                    throw new ComaintApiErrorUnauthorized('error.already_logged_in')

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

                const user = await authModel.login(email, password)
                const userId = user.id
                const companyId = user.companyId
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId , true)

                view.json({
                    'refresh-token': newRefreshToken,
                    'access-token': newAccessToken
                })
            }
            catch(error) {
                view.error(error)
            }
        })

        expressApp.post('/api/v1/auth/logout', async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId // HTTP token header
                if (userId === null)
                    throw new ComaintApiErrorUnauthorized('error.user_not_logged_in')
                const refreshTokenId = request.refreshTokenId // HTTP token header
                assert(refreshTokenId !== null)
                await authModel.logout(userId, refreshTokenId)
                const jsonResponse = {
                    userId: null,
                    'access-token': null,
                    'refresh-token': null
                }
                view.json(jsonResponse)
            }
            catch(error) {
                view.error(error)
            }
        })


        expressApp.get('/api/v1/profile', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                const user = await authModel.getUserProfile(userId)
                view.json({ user })
            }
            catch(error) {
                console.log(error)
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

const requireUserAuth = (request, response, next) => {
    const userId = request.userId
    const connected = request.userConnected
    assert(userId !== undefined)
    assert(connected !== undefined)
    console.log(`require user auth, userId:${userId}, connected:${connected}`)
    if (userId === null || connected !== true)
        return response.status(401).json({ error: 'Unauthorized' }) // FIXME translation
    next()
}

export { requireUserAuth }
export default AuthRoutesSingleton
