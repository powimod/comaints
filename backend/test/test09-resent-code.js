'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_RESEND_CODE = 'api/v1/auth/resendCode'
const ROUTE_LOGIN= 'api/v1/auth/login'
const ROUTE_CHANGE_EMAIL = 'api/v1/account/change-email'
const ROUTE_VALIDATE = 'api/v1/auth/validate'

describe('Test delete account route', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    const dte = new Date()
    const originalEmail = `u${dte.getTime()}A@x.y`
    const newEmail = `u${dte.getTime()}B@x.y`
 
    let user = null
    let userId = null
    let authCode  = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({email: originalEmail, password: PASSWORD, logout:true})
        userId = user.id
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })

    it ('Try resending code without being connected', async () => {
        try {
            const json = await jsonPost(ROUTE_RESEND_CODE)
            expect.fail('Call with no data not detected')
        }
        catch (error) {
            expect(error).to.be.instanceOf(Error)
            expect(error.message).to.equal('Unauthorized')
        }
    })

     it('Call login route', async () => {
        let json = await jsonPost(ROUTE_LOGIN, {
                email:user.email,
                password: PASSWORD
            })
        expect(json).to.be.instanceOf(Object)
        expect(json).to.have.property('access-token')
        expect(json['access-token']).to.be.a('string')
        expect(json).to.have.property('refresh-token')
        expect(json['refresh-token']).to.be.a('string')
        // check token in util.js
        expect(accessToken).not.to.equal(null)
        expect(refreshToken).not.to.equal(null)
    })

    it ('Try resending code without auth operation in progress', async () => {
        try {
            const json = await jsonPost(ROUTE_RESEND_CODE, {sendCodeByEmail: false})
            expect.fail('Call with no data not detected')
        }
        catch (error) {
            expect(error).to.be.instanceOf(Error)
            expect(error.message).to.equal('No authentification operation in progress')
        }
    })

    it('Call route to change email', async () => {
        const json = await jsonPost(ROUTE_CHANGE_EMAIL, {email:newEmail, password:PASSWORD, sendCodeByEmail: false})
        expect(json).to.be.instanceOf(Object)
        expect(json).to.have.property('message')
        expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code')
    })

    // TODO send a bad auth code to increment auth_attempts

    it('Get auth token in database before code resent', async () => {
        const dbUser = await getDatabaseUserById(user.id)
        expect(dbUser).to.be.instanceOf(Object)
        expect(dbUser.auth_action).to.equal('change-email')
        expect(dbUser.auth_attempts).to.be.equal(0) // TODO check 1
        expect(dbUser.auth_code).to.be.above(0)
        authCode = dbUser.auth_code
    })

    it ('Call route to resend auth code', async () => {
        const json = await jsonPost(ROUTE_RESEND_CODE, {sendCodeByEmail: false})
        expect(json).to.be.instanceOf(Object)
        expect(json).to.have.property('message')
        expect(json.message).to.be.a('string').and.to.equal('Code resent')
    })

     it('Get new auth token in database after code resent', async () => {
        const dbUser = await getDatabaseUserById(user.id)
        expect(dbUser).to.be.instanceOf(Object)
        expect(dbUser.auth_action).to.equal('change-email')
        expect(dbUser.auth_attempts).to.be.equal(0)
        expect(dbUser.auth_code).to.be.above(0)
        expect(dbUser.auth_code).not.to.equal(authCode)
    })


    // TODO send new token


})


