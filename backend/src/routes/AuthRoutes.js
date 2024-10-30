'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, 
    ComaintApiErrorInvalidToken, ComaintApiError, comaintErrors } from '../../../common/src/error.mjs'
import { AccountState } from '../../../common/src/global.mjs'
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs'
import userObjectDef from '../../../common/src/objects/user-object-def.mjs'


class AuthRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance()

        const authModel = model.getAuthModel()

        const _renewTokens = async(refreshToken) => {
            if (typeof(refreshToken) !== 'string')
                throw new Error('Invalid refresh token')
            console.log("dOm renew tokens - check refresh token ...")
            let tokenFoundInDatabase, tokenId, userId, connected, companyId
            try {
                [tokenFoundInDatabase, tokenId, userId, connected, companyId] = await authModel.checkRefreshToken(refreshToken)
            }
            catch (error) {
                console.log("dOm renew tokens - error while checking refresh token", error)
                throw error
            }
            console.log("dOm renew tokens : connected", connected)
            assert(typeof(connected) === 'boolean')

            if (! tokenFoundInDatabase) {
                console.log("dOm renew tokens : not token found in database")
                // if a token is not found in database, it should be an attempt to usurp token :
                // since a refresh token is deleted when used, it will not be found with a second attempt to use it.
                console.log(`Token renew - detection of an attempt to reuse a refresh token : lock account userId = ${userId}`)
                await authModel.lockAccount(userId)
                // TODO send an email 
                throw new Error('Attempt to reuse a refresh token') // TODO send a ComaintError
            }

            // remove refresh token from database
            console.log("dOm renew tokens : remove refresh token from database")
            await authModel.deleteRefreshToken(tokenId)

            const isLocked = await authModel.isAccountLocked(userId)
            if (await authModel.isAccountLocked(userId)) {
                console.log(`Token renew - account locked userId = ${userId}`)
                throw new Error('Account locked') // TODO send a ComaintError
            }

            const user = await authModel.getUserProfile(userId)
            if (user === null)
                throw new Error('User account does not exist')
            if (companyId !== user.companyId)
                throw new Error('Invalid company ID in refresh token')

            console.log("dOm renew tokens : generate new tokens")
            const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, connected)
            const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId , true)

            return [ userId, companyId, newAccessToken, newRefreshToken, connected ]
        }

        // middleware to manage access and refresh tokens
        expressApp.use( async (request, response, next) => {
            assert(request.view !== undefined) // view middleware must have been called first
            const view = request.view
            console.log(`Token middleware : token management for request ${request.url} ...`)
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

            const refreshToken = request.headers['x-refresh-token']
            const accessToken  = request.headers['x-access-token']

            if (refreshToken !== undefined) {
                // FIXME gérer les exceptions ici ?
                try {
                    console.log("dOm ================ call renewTokens")
                    const [ tokenUserId, tokenCompanyId, newAccessToken, newRefreshToken, connected ] = await _renewTokens(refreshToken)
                    console.log("dOm ================ renewed tokens userID =", userId)
                    userId = tokenUserId
                    companyId = tokenCompanyId
                    view.storeRenewedTokens(newAccessToken, newRefreshToken)
                }
                catch (error) {
                        view.error(error) // FIXME send a ComaintError
                }
            }
            else {
                if (accessToken === undefined) {
                    console.log(`Token middleware -> access token absent (anonymous request)`)
                }
                else {
                    try {
                        [userId, companyId, refreshTokenId, connected] = await authModel.checkAccessToken(accessToken, expiredAccessTokenEmulation)
                        console.log(`Token middleware -> userId = ${userId}`)
                        console.log(`Token middleware -> companyId = ${companyId}`)
                        console.log(`Token middleware -> refreshTokenId = ${refreshTokenId}`)
                        console.log(`Token middleware -> connected = ${connected}`)
                    }
                    catch (error) {
                        // TODO add selftest to check invalid token 
                        const errorMessage = error.message ? error.message : error
                        console.log(`Token middleware -> error : ${errorMessage}`)
                        // FIXME how to reset access and refresh tokens
                        view.error(
                            new ComaintApiErrorInvalidToken(view.translation('error.access_token_error', {error: errorMessage})),
                            { resetTokens: true }
                        )
                        return
                    }
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
            const view = request.view
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

                let userId = null
                let companyId = null
                let registeredAccount = false

                // Si le compte existe déjà pour cet email alors on va tester si le compte est en cours
                // d'enregistrement ou s'il est opérationnel.
                // S'il est déjà opérationnel, on envoie un mail à l'utilisateur pour l'informer d'une tentative de
                // création d'un compte avec son email et on ne signale pas que le compte est déjà utilisé 
                // car ça donne des informations à un pirate que le compte existe.
                // Si le compte existe déjà mais qu'il est en cours d'enregistrement, on va juste générer
                // un nouveau code d'authentification.
                let profile = await authModel.getUserProfileByEmail(email)
                if (profile !== null) {
                    if (profile.state !== AccountState.PENDING) {
                        // if user is fully registered, send him an information message
                        if (sendCodeByEmail)
                            await authModel.sendExistingEmailAlertMessage(email, view.translation)
                        registeredAccount = true
                    }
                    userId = profile.id
                    companyId = profile.companyId
                }

                // if account does not exist or is not fully registered
                if (registeredAccount === false) {
                    const result = await authModel.register(email, password, authCode, invalidateCodeImmediately)

                    const user = result.user
                    assert(user !== undefined)
                    userId = user.id
                    companyId = user.companyId
                    assert(userId !== undefined)
                    assert (companyId === null) // companyId should be null

                    if (sendCodeByEmail)
                        await authModel.sendRegisterAuthCode(authCode, email, view.translation)
                }


                // generate new tokens with userConnected = false
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, false)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, newRefreshTokenId, false)

                view.json({
                    message: 'User registration done, waiting for validation code',
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
            const view = request.view
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
                    if (user === null) {
                        // with delete account route, user is set to null
                        userId = null
                        jsonResponse['access-token'] = null
                        jsonResponse['refresh-token'] = null
                    }
                    else {
                        // generate a new access token with userConnected = true
                        userId = user.id
                        const newAccessToken  = await authModel.generateAccessToken(userId, companyId, refreshTokenId, true)
                        const newRefreshToken  = await authModel.generateRefreshToken(userId, companyId, refreshTokenId, true)
                        jsonResponse['access-token'] = newAccessToken
                    }
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
            const view = request.view
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
            const view = request.view
            try {
                if (request.userConnected)
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

                console.log("Auth login email", email)
                const user = await authModel.login(email, password)
                const userId = user.id
                const companyId = user.companyId
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, true)
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
            const view = request.view
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
            const view = request.view
            try {
                const refreshToken = request.body.token
                if (refreshToken === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'token'})
                if (typeof(refreshToken) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'token'})

                const [ userId, companyId, newAccessToken, newRefreshToken, connected ] = await _renewTokens(refreshToken)
                
                console.log(`auth/refresh - send new tokens userId ${userId}`)
                view.json({
                    'userId' : userId,
                    'connected': connected,
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
    const view = request.view
    assert(view !== undefined)
    const userId = request.userId
    const connected = request.userConnected
    assert(userId !== undefined)
    assert(connected !== undefined)
    console.log(`require user auth, userId:${userId}, connected:${connected}`)
    if (userId === null || connected !== true) {
        view.error(new ComaintApiErrorUnauthorized(view.translation('error.unauthorized_access')))
        return
    }
    next()
}

export { requireUserAuth }
export default AuthRoutesSingleton
