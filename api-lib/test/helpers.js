'use strict'

import { expect } from 'chai'

import { api, requestDb } from './util.js'

const DEFAULT_PASSWORD = 'abC.dEf.GH1.lMn!'

const createUserAccount = async (options = {}) => {
    let {
        email = null,
        password = DEFAULT_PASSWORD,
        logout = false,
        withCompany = false
    } = options

    if (email === null) {
        const dte = new Date()
        email = `u${dte.getTime()}@x.y`
    }

    if (api === null)
        throw new Error('API not initialized')
    let json = await api.auth.register({email, password, sendMail:false})

    let user = await getDatabaseUserByEmail(email)
    expect(user).to.be.instanceOf(Object)
    expect(user).to.have.property('auth_code')
    const authCode = user.auth_code
    expect(authCode).to.be.a('number')

    json = await api.auth.validate({code: authCode})
    expect(json).to.be.instanceOf(Object)
    expect(json).to.have.property('validated')
    expect(json.validated).to.be.a('boolean').and.to.equal(true)

    if (withCompany) {
        const companyName = 'My company'
        let company = await api.company.initializeCompany(companyName)
        expect(company).to.be.instanceOf(Object).and.to.have.keys('id', 'name')
        expect(company.id).to.be.a('number')
        expect(company.name).to.be.a('string').and.to.equal(companyName)
    }

    if (logout) {
        json = await api.auth.logout()
        expect(json).to.be.instanceOf(Object)
    }

    return user 
}

const deleteUserAccountById = async (userId) => {
    if (userId === null)
        return
    await requestDb('DELETE FROM users WHERE id=?', userId)
}

const getDatabaseUserByEmail = async (email) => {
    const res = await requestDb('select * from users where email=?', [ email ])
    expect(res).to.be.instanceOf(Array)
    const user = res[0]
    expect(user).to.be.instanceOf(Object)
    expect(user).to.have.property('email')
    expect(user.email).to.equal(email)
    return user
}

const getDatabaseUserById = async (userId) => {
    const res = await requestDb('select * from users where id =?', [ userId])
    expect(res).to.be.instanceOf(Array)
    if (res.length === 0)
        return null // user not found with this id
    const user = res[0]
    return user
}

const userPublicProperties = [
    'id', 'email', 'firstname', 'lastname', 'state', 'lastUse', 'administrator', 'companyId'
]

export {
    createUserAccount,
    deleteUserAccountById,
    getDatabaseUserByEmail,
    getDatabaseUserById,
    userPublicProperties 
}
