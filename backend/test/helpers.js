'use strict'

import { expect } from 'chai'

import { jsonGet, jsonPost, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_LOGOUT = 'api/v1/auth/logout'
const ROUTE_VALIDATE = 'api/v1/auth/validateRegistration'

const DEFAULT_PASSWORD = 'abC.dEf.GH1.lMn!'

const createUserAccount = async (options = {}) => {
    let {
        email = null,
        password = DEFAULT_PASSWORD,
        logout = false
    } = options

    if (email === null) {
        const dte = new Date()
        email = `u${dte.getTime()}@x.y`
    }

	let json = await jsonPost(ROUTE_REGISTER, { email, password, sendCodeByEmail: false })

    const res = await requestDb('select * from users where email=?', [ email ])
    expect(res).to.be.instanceOf(Array)
    const user = res[0]
    expect(user).to.be.instanceOf(Object)
    expect(user).to.have.property('id')
    const authCode = user.auth_code

    json = await jsonPost(ROUTE_VALIDATE, { code: authCode})
    expect(json).to.be.instanceOf(Object)
    expect(json).to.have.property('validated')
    expect(json.validated).to.be.a('boolean').and.to.equal(true)

    if (logout)
        await jsonPost(ROUTE_LOGOUT)

    return {
        id: user.id,
        email: user.email
    }
}

const deleteUserAccount = async (user) => {
    if (user === null || typeof(user) !== 'object')
        return
    await requestDb('DELETE FROM users WHERE id=?', user.id)
}

export {
    createUserAccount,
    deleteUserAccount
}
