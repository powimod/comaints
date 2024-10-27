'use strict'
import { expect } from 'chai'

import { api, initializeApi, terminateApi, connectDb, disconnectDb, requestDb } from './util.js'
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

        it ('Try to send a bad validation code', async () => {
            const badAuthCode = authCode + 1
            const json = await api.auth.validate({code: badAuthCode})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.keys('userId', 'validated')
            expect(json.userId).to.be.a('number')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
        })
 
        it ('Send validation code', async () => {
            const json = await api.auth.validate({code: authCode})
            // refresh token is not present because previous refresh token is still valid
            expect(json).to.have.keys('access-token', 'userId', 'validated')
            expect(json['access-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json.userId).to.be.a('number')
            expect(json.validated).to.be.a('boolean').and.to.equal(true)
        })
    })
 
})
