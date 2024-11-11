'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_CHANGE_EMAIL = 'api/v1/account/change-email'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_LOGIN= 'api/v1/auth/login'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'

describe('Test change password route', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let user = null
    let authCode  = null
    const dte = new Date()
    const originalEmail = `u${dte.getTime()}A@x.y`
    const newEmail = `u${dte.getTime()}B@x.y`

    const userEmail2 = `u${dte.getTime()}@x.y`
    let user2 = null
 
    before( async () =>  {
        loadConfig()
        await connectDb()
        user2 = await createUserAccount({email:userEmail2})
        user = await createUserAccount({email:originalEmail, password: PASSWORD})
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await deleteUserAccount(user2)
        await disconnectDb()
    })


    describe('Call change email route with invalid data', () => {
        it('Try to change email without data', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {})
                expect.fail('Call with no data not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Parameter «email» not found in request body')
            }
        })

        it('Try to change email with invalid type for email', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:123})
                expect.fail('Call with invalid type for email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid value for «newEmail» parameter in request body')
            }
        })

        it('Try to change email with malformed email', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:'abc'})
                expect.fail('Call with malformed email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Property «email» is not a valid email')
            }
        })


        it('Try to change email without password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail})
                expect.fail('Call without password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Parameter «password» not found in request body')
            }
        })

        it('Try to change email with invalid type password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:123})
                expect.fail('Call without invalid type password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid value for «password» parameter in request body')
            }
        })

        it('Try to change email with invalid password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:'abc'})
                expect.fail('Call without invalid password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Password is too small')
            }
        })

        it('Try to change email with incorrect password', async () => {
            const badPassword = `${PASSWORD}+X`
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:badPassword})
                expect.fail('Call without incorrect password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid password')
            }
        })

        it('Try to change email the same email', async () => {
            const sameEmail = originalEmail
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:sameEmail, password:PASSWORD})
                expect.fail('Call with same email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('New email address is the same')
            }
        })

        it('Try to change email with an already used email', async () => {
            const alreadyUsedEmail = userEmail2 
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:alreadyUsedEmail , password:PASSWORD})
                expect.fail('Call with already used email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Email address is already used')
            }
        })
    })

    describe('Call change email route with valid email', () => {

        it('Call route to change email', async () => {
            const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:PASSWORD, sendCodeByEmail: false})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('message')
            expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code')
        })

        it('Check user in database before code validation', async () => {
            const dbUser = await getDatabaseUserById(user.id)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.email).to.equal(originalEmail) // email not yet changed
            expect(dbUser.auth_action).to.equal('change-email')
            expect(dbUser.auth_data).to.equal(newEmail) // future email
            expect(dbUser.auth_attempts).to.be.equal(0)
            expect(dbUser.auth_code).to.be.above(0)
            authCode = dbUser.auth_code
        })

        it('Call route with incorrect code', async () => {
            const badCode = authCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { code: badCode})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
        })

        it('Check user in database after bad code attempt', async () => {
            const dbUser = await getDatabaseUserById(user.id)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.email).to.be.equal(originalEmail)
            expect(dbUser.auth_action).to.be.a('string').and.to.equal('change-email')
            expect(dbUser.auth_attempts).to.be.a('number').and.to.be.equal(1)
            expect(dbUser.auth_data).to.be.equal(newEmail)
        })


        it('Call route to validate email change', async () => {
            const json = await jsonPost(ROUTE_VALIDATE, { code: authCode})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('context', 'validated', 'access-token', 'refresh-token')
            expect(json.validated).to.be.a('boolean').and.to.equal(true)
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected')
            expect(json.context.email).to.be.a('string').and.to.equal(newEmail)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(true)
            expect(json['access-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json['refresh-token']).to.be.a('string').and.to.have.length.above(0)
        })

        it('Check user in database after code validation', async () => {
            const dbUser = await getDatabaseUserById(user.id)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.email).to.equal(newEmail)
            expect(dbUser.auth_action).to.equal(null)
            expect(dbUser.auth_data).to.equal(null)
            expect(dbUser.auth_attempts).to.be.equal(null)
            expect(dbUser.auth_code).to.be.equal(null)
        })

        it('Call logout route', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message')
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected')
            expect(json.context.email).to.be.equal(null)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(false)
            expect(json.message).to.be.a('string').and.to.equal('logout success')
            expect(json['access-token']).to.equal(null)
            expect(json['refresh-token']).to.equal(null)
            // check token in util.js
            expect(accessToken).to.equal(null)
            expect(refreshToken).to.equal(null)
        })

        it('Try to login with previous email', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, { email: originalEmail, password: PASSWORD })
                expect.fail("Attempt to log with previous email not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Invalid EMail or password`)
            }
        })

        it('Check login with new email', async () => {
            let json = await jsonPost(ROUTE_LOGIN, { email: newEmail, password: PASSWORD })
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message')
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected')
            expect(json.context.email).to.be.a('string').and.to.equal(newEmail)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(true)
            expect(json.message).to.be.a('string').and.to.equal('login success')
            expect(json['access-token']).not.to.equal(null)
            expect(json['refresh-token']).not.to.equal(null)
            // check token in util.js
            expect(accessToken).not.to.equal(null)
            expect(refreshToken).not.to.equal(null)
        })

    })
})
