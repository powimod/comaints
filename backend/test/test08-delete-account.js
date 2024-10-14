'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserById } from './helpers.js'

const ROUTE_DELETE_ACCOUNT = 'api/v1/account/delete'

describe('Test delete account route', () => {

    let user = null
    let authCode  = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount()
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })


    /*
    describe('Call account delete route with invalid data', () => {
        it('Try to call account delete route without data', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_EMAIL, {})
                expect.fail('Call with no data not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('xxx')
            }
        })
    })
    */

    describe('Call account delete route with valid email', () => {

        it('Call route to delete account', async () => {
            const json = await jsonPost(ROUTE_DELETE_ACCOUNT, {confirmation:true, sendCodeByEmail: false})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('message')
            expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code')
        })

        /*
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
        */

    })
})


