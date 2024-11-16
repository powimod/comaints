'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_DELETE_ACCOUNT = 'api/v1/account/delete'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_LOGIN = 'api/v1/auth/login'
const ROUTE_PROFILE  = 'api/v1/account/profile'

describe('Test delete account route', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    const dte = new Date()
    const userEmail = `u${dte.getTime()}@x.y`
 
    let user = null
    let userId = null
    let authCode  = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({email: userEmail, password: PASSWORD})
        userId = user.id
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })

    describe('Call account delete route with invalid data', () => {
        it('Try to call account delete route without data', async () => {
            try {
                const json = await jsonPost(ROUTE_DELETE_ACCOUNT, {})
                expect.fail('Call with no data not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Parameter «confirmation» not found in request')
            }
        })
    })

    describe('Call account delete route with valid email', () => {

        it('Call route to delete account', async () => {
            const json = await jsonPost(ROUTE_DELETE_ACCOUNT, {confirmation:true, sendCodeByEmail: false})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('message')
            expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code')
            expect(accessToken).not.to.equal(null)
            expect(refreshToken).not.to.equal(null)
        })

        it('Check user in database before code validation', async () => {
            const dbUser = await getDatabaseUserById(user.id)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.email).to.equal(user.email) // email not yet changed
            expect(dbUser.auth_action).to.equal('account-deletion')
            expect(dbUser.auth_data).to.equal(null) // future email
            expect(dbUser.auth_attempts).to.be.equal(0)
            expect(dbUser.auth_code).to.be.above(0)
            authCode = dbUser.auth_code
        })

        it('Send validation code', async () => {
            const json = await jsonPost(ROUTE_VALIDATE, { code: authCode })
            expect(json).to.be.instanceOf(Object).and.to.have.keys('context', 'validated', 'access-token', 'refresh-token')
            expect(json.validated).to.be.a('boolean').and.to.equal(true)
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(json.context.email).to.equal(null)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(false)
            expect(json.context.administrator).to.be.a('boolean').and.to.equal(false)
            expect(json.context.company).to.be.a('boolean').and.to.equal(false)
            expect(json['access-token']).to.equal(null)
            expect(json['refresh-token']).to.equal(null)
            // check token in util.js
            expect(accessToken).to.equal(null)
            expect(refreshToken).to.equal(null)
        })

        it('Check user was deleted in database after code validation', async () => {
            const dbUser = await getDatabaseUserById(userId)
            expect(dbUser).to.equal(null)
        })

        it('Try to access profile after account deletion', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE)
                expect.fail('Profile access with deleted account not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Unauthorized access')
            }
        })

        it(`Try to login after account deletion`, async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email: userEmail,
                        password: PASSWORD
                    })
                expect.fail("Login with deleted account not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                //User already connected
                expect(error.message).to.equal(`Invalid EMail or password`)
            }
        })

    })
})


