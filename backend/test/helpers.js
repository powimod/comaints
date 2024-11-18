'use strict'

import { expect } from 'chai'

import { jsonPost, requestDb, getTokens, setTokens } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_LOGIN = 'api/v1/auth/login'
const ROUTE_LOGOUT = 'api/v1/auth/logout'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_INITIALIZE_COMPANY= 'api/v1/company/initialize'

const DEFAULT_PASSWORD = 'abC.dEf.GH1.lMn!'

const tokensCache = {}
let currentUser = null

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
        expect(json).to.be.instanceOf(Object).and.to.have.keys('company', 'access-token', 'refresh-token', 'context')
        const company = json.company
        expect(company).to.be.instanceOf(Object).and.to.have.keys('id', 'name')
        expect(company.id).to.be.a('number')
        expect(company.name).to.be.a('string').and.to.equal(companyName)
        companyId = company.id
    }

    currentUser = user
    tokensCache[currentUser.id] = getTokens()

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
    let companyId = null
    if (user.companyId)
        companyId = user.companyId
    if (user.id_company)
        companyId = user.id_company
    if (companyId)
        await requestDb('DELETE FROM companies WHERE id=?', companyId)
    await requestDb('DELETE FROM users WHERE id=?', user.id)
}

const changeUser = async (user) => {
    if (user === null || typeof(user) !== 'object')
        throw new Error('Invalid «user» argument')
    if (currentUser.id === user.id)
        return currentUser
    if (currentUser !== null) 
        tokensCache[currentUser.id] = getTokens()
    const tokens = tokensCache[user.id]
    if (tokens === undefined)
        throw new Error('Tokens not found')
    currentUser = user
    setTokens(tokens)
    return currentUser
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
    changeUser,
    getDatabaseUserByEmail,
    getDatabaseUserById,
    userPublicProperties,
    connectWithAdminAccount,
    currentUser
}
