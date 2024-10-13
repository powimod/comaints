'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_CHANGE_EMAIL = 'api/v1/account/change-email'

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
                expect(error.message).to.equal('Server status 400 ({"error":"Parameter «email» not found in request body"})')
            }
        })

        it('Try to change email with invalid type for email', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:123})
                expect.fail('Call with invalid type for email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Invalid value for «newEmail» parameter in request body"})')
            }
        })

        it('Try to change email with malformed email', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:'abc'})
                expect.fail('Call with malformed email not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Property «email» is not a valid email"})')
            }
        })


        it('Try to change email without password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail})
                expect.fail('Call without password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Parameter «password» not found in request body"})')
            }
        })

        it('Try to change email with invalid type password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:123})
                expect.fail('Call without invalid type password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Invalid value for «password» parameter in request body"})')
            }
        })

        it('Try to change email with invalid password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:'abc'})
                expect.fail('Call without invalid password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password is too small"})')
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
                expect(error.message).to.equal('Server status 401 ({"error":"Invalid password"})')
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
                expect(error.message).to.equal('Server status 400 ({"error":"New email address is the same"})')
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
                expect(error.message).to.equal('Server status 400 ({"error":"Email address is already used"})')
            }
        })


    })

    describe('Call change email route with valid email', () => {

        it('Call route to change email', async () => {
            const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:PASSWORD})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('message')
            expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code')
        })

        it('Check user in database', async () => {
            const dbUser = await getDatabaseUserById(user.id)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.email).to.equal(originalEmail) // email not yet changed
            expect(dbUser.auth_action).to.equal('change-email')
            expect(dbUser.auth_data).to.equal(newEmail) // future email
            expect(dbUser.auth_code).to.be.above(0)
            expect(dbUser.auth_attempts).to.be.equal(0)
        })

    })
})


