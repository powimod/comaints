'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_RESEND_CODE = 'api/v1/auth/resendCode'
const ROUTE_LOGIN= 'api/v1/auth/login'

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
        user = await createUserAccount({email: userEmail, password: PASSWORD, logout:true})
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
            expect(error.message).to.equal('Server status 401 ({"error":"Unauthorized"})')
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
            const json = await jsonPost(ROUTE_RESEND_CODE)
            expect.fail('Call with no data not detected')
        }
        catch (error) {
            expect(error).to.be.instanceOf(Error)
            expect(error.message).to.equal('Server status 400 ({"error":"No authentification operation in progress"})')
        }
    })

    /*
    describe('Resending code while changing password', () => {
    })
    */

})


