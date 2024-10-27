'use strict'

import assert from 'assert'

import View from '../view.js'
import ModelSingleton from '../model.js'
import ControllerSingleton from '../controller.js'
import { requireUserAuth } from './AuthRoutes.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs'
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs'
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
                let user = await accountModel.getUserProfile(userId)
                user = buildPublicObjectVersion(userObjectDef, user)
                view.json({ user })
            }
            catch(error) {
                view.error(error)
            }
        })

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


        expressApp.post('/api/v1/account/change-email', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null)
                let user = await accountModel.getUserProfile(userId)
                if (! user)
                    throw new Error('User not found')

                let newEmail = request.body.email
                if (newEmail === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'email'})
                if (typeof(newEmail) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'newEmail'})
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', newEmail)
                if (errorMsg1)
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1)

                let currentPassword = request.body.password
                if (currentPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'password'})
                if (typeof(currentPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'password'})
                const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', currentPassword)
                if (errorMsg2)
                    throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2)

                const isCurrentPassordValid = await accountModel.checkPassword(userId, currentPassword)
                if (! isCurrentPassordValid )
                    throw new ComaintApiErrorUnauthorized('error.invalid_password')

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true

                const invalidateCodeImmediately = (request.body.invalidateCodeImmediately !== undefined) ?
                    request.body.invalidateCodeImmediately : false

                // make a random validation code which will be sent by email to unlock account
                const authCode = accountModel.generateRandomAuthCode()
                console.log(`Validation code is ${ authCode }`) // TODO remove this

                user = await accountModel.prepareEmailChange(userId, newEmail, authCode, invalidateCodeImmediately)

                if (sendCodeByEmail)
                    await accountModel.sendChangeEmailAuthCode(authCode, user.email, newEmail, view.translation)

                view.json({message: 'Done, waiting for validation code'})
            }
            catch(error) {
                view.error(error)
            }
        })

        expressApp.post('/api/v1/account/delete', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null)
                let user = await accountModel.getUserProfile(userId)
                if (! user)
                    throw new Error('User not found')

                let confirmation = request.body.confirmation
                if (confirmation === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'confirmation'})
                if (typeof(confirmation) !== 'boolean')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'confirmation'})

                // TODO check if user can be deleted with administrator and companyId properties
                // yes if companyId is null
                // yes if campanyId is not null but he is not an administrator

                const invalidateCodeImmediately = (request.body.invalidateCodeImmediately !== undefined) ?
                    request.body.invalidateCodeImmediately : false

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true

                // make a random validation code which will be sent by email to delete account
                const authCode = accountModel.generateRandomAuthCode()
                console.log(`Validation code is ${ authCode }`) // TODO remove this

                user = await accountModel.prepareAccountDeletion(userId, authCode, invalidateCodeImmediately)

                if (sendCodeByEmail)
                    await accountModel.sendAccountDeletionAuthCode(authCode, user.email, view.translation)

                view.json({ message: 'Done, waiting for validation code' })
            }
            catch(error) {
                view.error(error)
            }
        })

        expressApp.post('/api/v1/account/unlock', requireUserAuth, async (request, response) => {
            const view = new View(request, response)
            try {
                const userId = request.userId
                assert(userId !== null)
                let user = await accountModel.getUserProfile(userId)
                if (! user)
                    throw new Error('User not found')

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true

                // make a random validation code which will be sent by email to delete account
                const authCode = accountModel.generateRandomAuthCode()

                user = await accountModel.prepareAccountUnlock(userId, authCode)

                console.log("dOm send mail", sendCodeByEmail)
                if (sendCodeByEmail)
                    await accountModel.sendUnlockAccountAuthCode(authCode, user.email, view.translation)

                view.json({message: 'Done, waiting for validation code'})
            }
            catch(error) {
                console.log("dOm error", error)
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
