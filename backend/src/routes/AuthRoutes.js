'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, 
    ComaintApiError, comaintErrors } from '../../../common/src/error.mjs'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'


class AuthRoutes {

    initialize(expressApp) {
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

            // parameter «expiredToken» to emulate expired access Token (in GET or POST request)
            let expiredAccessTokenEmulation = false
            if (request.query.expiredAccessTokenEmulation  === 'true') // value is a string not a boolean
                expiredAccessTokenEmulation = true
            if (request.body.expiredAccessTokenEmulation === true)
                expiredAccessTokenEmulation = true

            const token = request.headers['x-access-token']
            if (token === undefined) {
                console.log(`Token middleware -> access token absent (anonymous request)`)
            }
            else {
                try {
                    [userId, companyId, refreshTokenId, connected] = await authModel.checkAccessToken(token, expiredAccessTokenEmulation)
                    console.log(`Token middleware -> userId = ${userId}`)
                    console.log(`Token middleware -> companyId = ${companyId}`)
                    console.log(`Token middleware -> refreshTokenId = ${refreshTokenId}`)
                    console.log(`Token middleware -> connected = ${connected}`)
                }
                catch (error) {
                    const errorMessage = error.message ? error.message : error
                    console.log(`Token middleware -> error : ${errorMessage}`)
                    // TODO View.sendJsonError(response, error)
                    // TODO add selftest to check invalid token 
                    return response.status(401).json({
                        error: comaintErrors.UNAUTHORIZED_ERROR,
                        message: errorMessage, // FIXME translation
                        'refresh-token': null,
                        'access-token': null
                    })
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

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ? 
                    request.body.sendCodeByEmail : true

                const invalidateCodeImmediately = (request.body.invalidateCodeImmediately !== undefined) ? 
                    request.body.invalidateCodeImmediately : false

                const authCode = authModel.generateRandomAuthCode()

                const result = await authModel.register(email, password, authCode, invalidateCodeImmediately)

                const user = result.user
                if (! user)
                    throw new Error('User not found in result')

                if (user.password !== undefined)
                    throw new Error('User object should not have a password property')

                const userId = user.id
                if (! userId)
                    throw new Error('userId not found')

                const companyId = user.companyId
                if (companyId === undefined )
                    throw new Error('companyId not found')
                if (companyId !== null)
                    throw new Error('companyId should be null')

                if (sendCodeByEmail)
                    await authModel.sendRegisterAuthCode(authCode, email, view.translation)

                // access token with userConnected = false
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId , false)

                view.json({
                    'refresh-token': newRefreshToken,
                    'access-token': newAccessToken
                })
            }
            catch(error) {
                view.error(error)
            }
        })


        // this route is public for registration, and private for email change
        expressApp.post('/api/v1/auth/validate', async (request, response) => {
            const view = new View(request, response)
            try {
                // get IDs from access token
                let userId = request.userId
                if (userId === null)
                    throw new Error('Access token not found in HTTP header')
                const companyId = request.companyId // can be null with newly registered user
                const refreshTokenId = request.refreshTokenId
                assert (refreshTokenId !== null)

                let code = request.body.code
                if (code === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'code'})
                if (typeof(code) !== 'number')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'code'})
                const [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'authCode', code)
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                const isAuthCodeValid = await authModel.checkAuthCode(userId, code)

                const jsonResponse = {}
                if (isAuthCodeValid) {
                    const user = await authModel.processAuthOperation(userId)
                    userId = (user === null) ? null : user.id
                    // generate a new access token with userConnected = true
                    const newAccessToken  = await authModel.generateAccessToken(userId, companyId, refreshTokenId, true)
                    jsonResponse['access-token'] = newAccessToken
                }

                // send userId to make API-Lib detect context change
                jsonResponse.userId = userId
                jsonResponse.validated = isAuthCodeValid
                view.json(jsonResponse)
            }
            catch(error) {
                view.error(error)
            }
        })

        // public auth
        expressApp.post('/api/v1/auth/resendCode', requireUserAuth, async (request, response) => {
            const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ? 
                request.body.sendCodeByEmail : true
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null) // due to requireUserAuth
                // self-test does not send validation code by email

                const profile = await authModel.getUserProfile(userId)
                const authCode = authModel.generateRandomAuthCode()
                if (sendCodeByEmail)
                    await authModel.sendRegisterAuthCode(authCode, profile.email, view.translation)
                await authModel.changeAuthCode(userId, authCode)

                view.json({ message: "Code resent"})
            }
            catch (error) {
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

        // public route (user not logged in are detected insight this function)
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

        // public route
        expressApp.post('/api/v1/auth/refresh', async (request, response) => {
            // do not control HTTP header access/refresh tokens : they may be null
            const view = new View(request, response)
            try {
                const refreshToken = request.body.token
                if (refreshToken === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'token'})
                if (typeof(refreshToken) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'token'})

                const [tokenFound, tokenId, userId, companyId] = await authModel.checkRefreshToken(refreshToken)
                if (! tokenFound) {
                    // if a token is not found, it should be an attempt to usurp token :
                    // since a refresh token is deleted when used, it will not be found with a second attempt to use it.
                    console.log(`auth/refresh - detect an attempt to reuse a token : lock account userId = ${userId}`)
                    await authModel.lockAccount(userId)
                    throw new Error('Attempt to reuse a token')
                }

                await authModel.deleteRefreshToken(tokenId)

                const isLocked = await authModel.isAccountLocked(userId)
                if (await authModel.isAccountLocked(userId)) {
                    console.log(`auth/refresh - account locked userId = ${userId}`)
                    throw new Error('Account locked')
                }

                const user = await authModel.getUserProfile(userId)
                if (user === null)
                    throw new Error('User account does not exist')
                if (companyId !== user.companyId)
                    throw new Error('Invalid company ID in refresh token')

                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId , true)

                console.log(`auth/refresh - send new tokens userId ${userId}`)
                view.json({
                    'userId' : userId,
                    'access-token': newAccessToken,
                    'refresh-token': newRefreshToken
                })
            }
            catch (error) {
                console.error("auth/refresh - error:", (error.message) ? error.message : error)
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
        return response.status(401).json({ 
            error: comaintErrors.UNAUTHORIZED_ERROR,
            message: 'Unauthorized' // FIXME translation
        })
    next()
}

export { requireUserAuth }
export default AuthRoutesSingleton
