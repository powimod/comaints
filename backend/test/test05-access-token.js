'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'


const ROUTE_LOGIN= 'api/v1/auth/login'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'
const ROUTE_PROFILE  = 'api/v1/profile'

describe('Test user login', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let user = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({password: PASSWORD})
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_LOGIN} with valid data`, () => {

        it('Check profile access', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.property('email')
            expect(user.email).to.be.a('string').and.to.equal(user.email)
        })

        it('Try to access with emulation of an expired token', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE, { expiredAccessTokenEmulation : true})
                expect.fail('Expired token emulation not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 401 ({"error":"Expired access token"})')
            }
        })


    })

})


