'use strict'
import { expect } from 'chai'

import { api, initializeApi, terminateApi, context, connectDb, disconnectDb, requestDb } from './util.js'
import { getDatabaseUserByEmail } from './helpers.js'

describe('Check login', () => {

    let authCode  = null
    const dte = new Date()
    const userEmail = `u${dte.getTime()}@x.y`
    const password = 'aBcdef+ghijkl9'
    let userId = null


	before( async () =>  {
        await connectDb()
		initializeApi()
	}),

    after( async () =>  {
        await requestDb('DELETE FROM users WHERE email=?', userEmail)
        await disconnectDb()
        await terminateApi()
    })


    describe('Check register route', () => {

        it ('Check context initial state', () => {
            expect(context).to.be.equal(null)
        })

        it ('Register account', async () => {
            const json = await api.auth.register({email:userEmail, password, sendMail:false})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.keys('access-token', 'refresh-token', 'message')
            expect(json.message).to.equal('User registration done, waiting for validation code')
            expect(json['access-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json['refresh-token']).to.be.a('string').and.to.have.length.above(0)
        })

        it ('Get auth code from database', async () => {
            // get auth code from database
            const dbUser = await getDatabaseUserByEmail(userEmail)
            authCode = dbUser.auth_code
            expect(authCode).to.be.a('number').and.to.be.above(0)
        })

        it ('Send validation code', async () => {
            const json = await api.auth.validate({code: authCode})
            // refresh token is not present because previous refresh token is still valid
            expect(json).to.have.keys('access-token', 'refresh-token', 'validated')
            expect(json['access-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json['refresh-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json.validated).to.be.a('boolean').and.to.equal(true)
        })

        it ('Check context after registration', () => {
            expect(context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(context.email).to.be.a('string').and.to.equal(userEmail)
            expect(context.connected).to.be.a('boolean').and.to.equal(true)
            expect(context.administrator).to.be.a('boolean').and.to.equal(false)
            expect(context.company).to.be.a('boolean').and.to.equal(false)
        })

        it ('Logout', async () => {
            const json = await api.auth.logout()
            // TODO json should be undefined
        })

        it ('Check context after logout', () => {
            expect(context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(context.email).to.be.equal(null)
            expect(context.connected).to.be.a('boolean').and.to.equal(false)
        })

        it ('Check login with valid credentials', async () => {
            const result = await api.auth.login(userEmail, password)
            expect(result).to.equal(undefined) // no result is returned
        })

        it ('Check context after login', () => {
            expect(context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(context.email).to.be.a('string').and.to.equal(userEmail)
            expect(context.connected).to.be.a('boolean').and.to.equal(true)
            expect(context.administrator).to.be.a('boolean').and.to.equal(false)
            expect(context.company).to.be.a('boolean').and.to.equal(false)
        })

        // TODO add a self-test of the route to change email

    })
 
})
