import assert from 'assert'

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


export { requireAdminAuth, requireUserAuth }

