'use strict'

import { expect } from 'chai'

import { jsonGet, jsonPost, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_LOGIN = 'api/v1/auth/login'
const ROUTE_LOGOUT = 'api/v1/auth/logout'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_INITIALIZE_COMPANY= 'api/v1/company/initialize'

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

    let companyId = null
    if (withCompany) {
        const companyName = 'My Company'
        let json = await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName})
        expect(json).to.be.instanceOf(Object).and.to.have.keys('id', 'name', 'access-token', 'refresh-token', 'context')
        expect(json.id).to.be.a('number')
        expect(json.name).to.be.a('string').and.to.equal(companyName)
        companyId = json.id
    }


    if (logout)
        await jsonPost(ROUTE_LOGOUT)

    return {
        id: user.id,
        email: user.email,
        companyId
    }
}

const deleteUserAccount = async (user) => {
    if (user === null || typeof(user) !== 'object')
        return
    if (user.companyId !== null)
        await requestDb('DELETE FROM companies WHERE id=?', user.companyId)
    await requestDb('DELETE FROM users WHERE id=?', user.id)
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

const connectWithAdminAccount = async () => {
    const adminEmail = process.env.ADMIN_EMAIL
    if (adminEmail === undefined)
        throw new Error('ADMIN_EMAIL not found in .env')
    const adminPassword = process.env.ADMIN_PASSWORD
    if (adminPassword === undefined)
        throw new Error('ADMIN_PASSWORD not found in .env')
    return await jsonPost(ROUTE_LOGIN, {email: adminEmail, password: adminPassword})
}

const userPublicProperties = [
    'id', 'email', 'firstname', 'lastname', 'state', 'lastUse', 'administrator', 'manager', 'companyId'
]

export {
    createUserAccount,
    deleteUserAccount,
    getDatabaseUserByEmail,
    getDatabaseUserById,
    userPublicProperties,
    connectWithAdminAccount 
}
