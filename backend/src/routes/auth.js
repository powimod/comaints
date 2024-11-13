import assert from 'assert'

import ModelSingleton from '../model.js'
import View from '../view.js'
import { ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs'

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

const requireAdminAuth = (request, response, next) => {
    const view = request.view
    assert(view !== undefined)
    const userId = request.userId
    const connected = request.userConnected
    const administrator = request.isAdministrator
    assert(userId !== undefined)
    assert(connected !== undefined)
    assert(administrator !== undefined)
    console.log(`require admin auth, userId:${userId}, connected:${connected}, administrator:${administrator}`)
    if (userId === null || connected !== true || administrator !== true) {
        view.error(new ComaintApiErrorUnauthorized(view.translation('error.unauthorized_access')))
        return
    }
    next()
}


const renewTokens = async (request) => {
    assert(request)
    const view = request.view

    const userId = request.userId
    assert(userId !== null)
    const companyId = request.companyId
    assert(companyId !== null)
    const refreshTokenId = request.refreshTokenId
    assert(refreshTokenId !== null)
    const connected = request.userConnected
    assert(typeof(connected) === 'boolean')

    const model  = ModelSingleton.getInstance()
    const authModel = model.getAuthModel()

    // remove refresh token from database
    console.log(`Delete token ${refreshTokenId} in database`)
    await authModel.deleteRefreshToken(refreshTokenId)

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
    const administrator = user.administrator


    const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, connected)
    const newAccessToken  = await authModel.generateAccessToken(userId, companyId, user.administrator, newRefreshTokenId, true)

    view.storeRenewedTokens(newAccessToken, newRefreshToken)
}

export { requireAdminAuth, requireUserAuth, renewTokens }

