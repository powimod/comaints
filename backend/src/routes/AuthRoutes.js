'use strict'

import assert from 'assert'

import { requireUserAuth } from './auth.js'
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
            let tokenFoundInDatabase, tokenId, userId, connected, companyId, administrator
            [tokenFoundInDatabase, tokenId, userId, connected, companyId] = await authModel.checkRefreshToken(refreshToken)

            if (! tokenFoundInDatabase) {
                // if a token is not found in database, it should be an attempt to usurp token :
                // since a refresh token is deleted when used, it will not be found with a second attempt to use it.
                console.log(`Token ${tokenId} not found in database`)
                console.log(`Token renew - detection of an attempt to reuse a refresh token : lock account userId = ${userId}`)
                await authModel.lockAccount(userId)
                // TODO send an email
                throw new ComaintApiErrorUnauthorized(view.translation('error.attempt_to_reuse_token'))
            }

            // remove refresh token from database
            console.log(`Delete token ${tokenId} in database`)
            await authModel.deleteRefreshToken(tokenId)

            const isLocked = await authModel.isAccountLocked(userId)
            if (await authModel.isAccountLocked(userId)) {
                console.log(`Token renew - account locked userId = ${userId}`)
                throw new ComaintApiErrorUnauthorized(view.translation('error.account_locked'))
            }

            const user = await authModel.getUserProfileById(userId)
            if (user === null)
                throw new Error('User account does not exist')
            if (companyId !== user.companyId)
                throw new Error('Invalid company ID in refresh token')
            administrator = user.administrator

            assert(typeof(connected) === 'boolean')
            const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, connected)
            const newAccessToken  = await authModel.generateAccessToken(userId, companyId, user.administrator, newRefreshTokenId, true)

            return [ userId, companyId, connected, newRefreshTokenId, newAccessToken, newRefreshToken, administrator ]
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
            let administrator = null 

            // parameter «expiredToken» to emulate expired access Token (in GET or POST request)
            let expiredAccessTokenEmulation = false
            if (request.query.expiredAccessTokenEmulation  === 'true') // GET : value is a string not a boolean
                expiredAccessTokenEmulation = true
            if (request.body.expiredAccessTokenEmulation === true) // POST
                expiredAccessTokenEmulation = true

            const refreshToken = request.headers['x-refresh-token']
            const accessToken  = request.headers['x-access-token']

            if (refreshToken !== undefined) {
                console.log(`Token middleware - refresh token found -> renew tokens`)
                try {
                    let newAccessToken, newRefreshToken
                    [ userId, companyId, connected, refreshTokenId, newAccessToken, newRefreshToken, administrator ] = await _renewTokens(refreshToken)
                    view.storeRenewedTokens(newAccessToken, newRefreshToken)
                }
                catch (error) {
                    const errorMessage = error.message ? error.message : error
                    console.log(`Token middleware - error : `, errorMessage)
                    view.error( new ComaintApiErrorInvalidToken(), { resetAccount: true })
                    return
                }
            }
            else if (accessToken !== undefined) {
                console.log(`Token middleware - access token found`)
                try {
                    [userId, companyId, refreshTokenId, connected, administrator] = await authModel.checkAccessToken(accessToken, expiredAccessTokenEmulation)
                }
                catch (error) {
                    // TODO add selftest to check invalid token
                    const errorMessage = error.message ? error.message : error
                    console.log(`Token middleware - error : ${errorMessage}`)
                    view.storeRenewedAccessToken(null) // reset only access token (refresh token is still valid)
                    view.error(error)
                    return
                }
            }
            else {
                console.log(`Token middleware - token not found (anonymous request)`)
            }
            console.log(`Token middleware : userId=${userId}, companyId=${companyId}, connected=${connected}, refreshTokenId = ${refreshTokenId}`)
            request.userId = userId
            request.companyId = companyId
            request.refreshTokenId = refreshTokenId
            request.userConnected = connected
            request.isAdministrator = administrator
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
                let administrator = null
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
                    administrator = profile.administrator
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
                    assert (user.administrator !== undefined)
                    administrator = user.administrator

                    if (sendCodeByEmail)
                        await authModel.sendRegisterAuthCode(authCode, email, view.translation)
                }

                assert (administrator !== null)

                // generate new tokens with userConnected = false
                const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, false)
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, administrator, newRefreshTokenId, false)

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


        // this route is public for registration, and private for email change, account unlock and account deletion
        expressApp.post('/api/v1/auth/validate', async (request, response) => {
            const view = request.view
            try {
                let user = null

                // try to get IDs from access token
                const userId = request.userId
                if (userId !== null) {
                    user = await authModel.getUserProfileById(userId)
                }
                else {
                    // if access token was not found try to use an email in request body (used to reset password)
                    const email = request.body.email
                    if (email === undefined)
                        throw new Error("Can't identify user by access-token or email") // TODO use ComaintApiError
                    if (typeof(email) !== 'string')
                        throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'email'})
                    const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email)
                    if (errorMsg1)
                        throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)
                    user = await authModel.getUserProfileByEmail(email)
                }

                if (user === null)
                    throw new Error('User not found') // FIXME silently ignore error ?

                let code = request.body.code
                if (code === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'code'})
                if (typeof(code) !== 'number')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'code'})
                const [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'authCode', code)
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam)

                const isAuthCodeValid = await authModel.checkAuthCode(user.id, code)

                if (isAuthCodeValid) {
                    user = await authModel.processAuthOperation(user.id)
                    if (user === null) {
                        // with delete account route, user is set to null
                        view.storeRenewedTokens(null, null)
                        view.storeRenewedContext({
                            email: null,
                            connected: false,
                            administrator: false,
                            company: false
                        })
                    }
                    else {
                        // TODO delete previous refresh token stored in request.refreshTokenId ?
                        // generate a new access token with userConnected = true
                        const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(user.id, user.companyId, true)
                        const newAccessToken  = await authModel.generateAccessToken(user.id, user.companyId, user.administrator, newRefreshTokenId, true)
                        view.storeRenewedTokens(newAccessToken, newRefreshToken)
                        view.storeRenewedContext({
                            email: user.email,
                            connected: true,
                            administrator: user.administrator,
                            company: user.companyId !== null
                        })
                    }
                }
                view.json({ validated: isAuthCodeValid })
            }
            catch(error) {
                view.error(error)
            }
        })

        // public route
        expressApp.post('/api/v1/auth/resend-code', async (request, response) => {
            const view = request.view
            // self-test does not send validation code by email
            const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                request.body.sendCodeByEmail : true
            try {
                let profile = null

                // try to get IDs from access token
                const userId = request.userId
                if (userId !== null) {
                    profile = await authModel.getUserProfileById(userId)
                }
                else {
                    // if access token was not found try to use an email in request body (used to reset password)
                    const email = request.body.email
                    if (email === undefined)
                        throw new Error("Can't identify user by access-token or email") // TODO use ComaintApiError
                    if (typeof(email) !== 'string')
                        throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'email'})
                    const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email)
                    if (errorMsg1)
                        throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)
                    profile = await authModel.getUserProfileByEmail(email)
                }

                if (profile === null)
                    throw new Error('User not found') // FIXME silently ignore error ?

                const authCode = authModel.generateRandomAuthCode()
                // TODO le mail à envoyer dépend de l'action en cours !!!
                if (sendCodeByEmail)
                    await authModel.sendRegisterAuthCode(authCode, profile.email, view.translation)
                await authModel.changeAuthCode(profile.id, authCode)

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
                const newAccessToken  = await authModel.generateAccessToken(userId, companyId, user.administrator, newRefreshTokenId , true)
                view.storeRenewedContext({
                    email: user.email,
                    connected: true,
                    administrator: user.administrator,
                    company: user.companyId !== null
                })
                view.storeRenewedTokens(newAccessToken, newRefreshToken)
                view.json({ message: 'login success'})
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
                view.storeRenewedTokens(null, null)
                view.storeRenewedContext({
                    email: null,
                    connected: false,
                    administrator: false,
                    company: false
                })
                view.json({ message: 'logout success'})
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

                const [ userId, companyId, connected, refreshTokenId, newAccessToken, newRefreshToken ] = await _renewTokens(refreshToken)

                console.log(`auth/refresh - send new tokens userId ${userId}`)
                view.storeRenewedTokens(newAccessToken, newRefreshToken)
                view.json({ message: 'token refresh done'})
            }
            catch (error) {
                console.error("auth/refresh - error:", (error.message) ? error.message : error)
                view.error(error)
            }
        })

        expressApp.post('/api/v1/auth/reset-password', async (request, response) => {
            const view = request.view
            const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?  request.body.sendCodeByEmail : true
            try {
                let email = request.body.email
                if (email === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'email'})
                if (typeof(email) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'email'})
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email)
                if (errorMsg1)
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)

                let newPassword = request.body.password
                if (newPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'password'})
                if (typeof(newPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'password'})
                const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', newPassword)
                if (errorMsg2)
                    throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2)

                const authCode = authModel.generateRandomAuthCode()
                if (sendCodeByEmail)
                    await authModel.sendResetPasswordAuthCode(authCode, email, view.translation)
                await authModel.preparePasswordReset(email, newPassword, authCode, false)

                view.json({ message: 'Password changed, waiting for validation code' })
            }
            catch (error) {
                console.error("Reset password error:", (error.message) ? error.message : error)
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
