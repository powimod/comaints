'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'


const ROUTE_LOGIN    = 'api/v1/auth/login'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'
const ROUTE_REFRESH  = 'api/v1/auth/refresh'
const ROUTE_PROFILE  = 'api/v1/account/profile'

describe('Test account routes', () => {

    let user = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount()
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),


    it('Check profile access', async () => {
        const json = await jsonGet(ROUTE_PROFILE)
        expect(json).to.be.instanceOf(Object)
        expect(json).to.have.property('user')
        const user = json.user
        expect(user).to.be.instanceOf(Object)
        expect(user).to.have.property('email')
        expect(user.email).to.be.a('string').and.to.equal(user.email)
    })



})


