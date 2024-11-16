import assert from 'assert'

import ModelSingleton from '../model.js'
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs'

const requireUserAuth = (request, _ , next) => {
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


const requireAdminAuth = (request, _ , next) => {
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


const requestPagination = (request, _, next) => {
    const DEFAULT_PAGE = 1
    const DEFAULT_LIMIT = 10
    const view = request.view
    assert(view !== undefined)
    let page, limit
    if (request.method === 'GET') {
        page = parseInt(request.query?.page || DEFAULT_PAGE)
        limit = parseInt(request.query?.limit || DEFAULT_LIMIT)
    }
    else {
        page = request.body?.page || DEFAULT_PAGE
        limit = request.body?.limit || DEFAULT_LIMIT
    }
    if (isNaN(page) || page < 1) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'page'}))
        return
    }
    if (isNaN(limit) || limit < 1) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'limit'}))
        return
    }
    const offset = (page - 1) * limit
    request.requestPagination = { page, limit, offset }
    next()
}

const requestFilters = (request, _, next) => {
    const view = request.view
    assert(view !== undefined)
    const filters = request.body.filters || {}
    if (typeof(filters) !== 'object') {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'filters'}))
        return
    }
    request.requestFilters = filters  
    next()
}

const requestProperties = (request, _, next) => {
    const view = request.view
    assert(view !== undefined)
    const properties = request.body.properties || null
    if (properties !== null && ! (properties instanceof Array)) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'properties'}))
        return
    }
    request.requestProperties = properties
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

    if (await authModel.isAccountLocked(userId)) {
        console.log(`Token renew - account locked userId = ${userId}`)
        throw new ComaintApiErrorUnauthorized(view.translation('error.account_locked'))
    }

    const user = await authModel.getUserProfileById(userId)
    if (user === null)
        throw new Error('User account does not exist')
    if (companyId !== user.companyId)
        throw new Error('Invalid company ID in refresh token')

    const [ newRefreshToken, newRefreshTokenId ] = await authModel.generateRefreshToken(userId, companyId, connected)
    const newAccessToken  = await authModel.generateAccessToken(userId, companyId, user.administrator, newRefreshTokenId, true)

    view.storeRenewedTokens(newAccessToken, newRefreshToken)
}


const renewContext = async (request, user) => {
    assert(request)
    assert(user)
    const view = request.view

    const email = user ? user.email : null
    const companyId = user ? user.companyId : null
    const company = (companyId !== null)
    const administrator = user ? user.administrator : null

    const connected = request.userConnected
    assert(typeof(connected) === 'boolean')

    view.storeRenewedContext({
        email,
        connected,
        administrator,
        company
    })
}


export { 
    requireAdminAuth, 
    requireUserAuth, 
    renewTokens, 
    renewContext, 
    requestPagination,
    requestFilters,
    requestProperties
}
