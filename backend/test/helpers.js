'use strict'

import { expect } from 'chai'

import { jsonGet, jsonPost, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_VALIDATE = 'api/v1/auth/validateRegistration'

const createRandomUserAccount = async () => {

    const dte = new Date()
    const userEmail = `u${dte.getTime()}@x.y`
    const userPassword = 'abC.dEf.GH1.lMn!'

	let json = await jsonPost(ROUTE_REGISTER, {
        email: userEmail,
        password: userPassword,
        sendCodeByEmail: false
    })

    const res = await requestDb('select * from users where email=?', [ userEmail ])
    expect(res).to.be.instanceOf(Array)
    const user = res[0]
    expect(user).to.be.instanceOf(Object)
    expect(user).to.have.property('id')
    const validationCode = user.validation_code

    json = await jsonPost(ROUTE_VALIDATE, { code: validationCode})
    expect(json).to.be.instanceOf(Object)
    expect(json).to.have.property('validated')
    expect(json.validated).to.be.a('boolean').and.to.equal(true)

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
    createRandomUserAccount,
    deleteUserAccount
}
