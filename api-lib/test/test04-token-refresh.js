'use strict'
import { expect } from 'chai'

import { api, initializeApi, terminateApi, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccountById, getDatabaseUserById } from './helpers.js'

describe('Check token refresh', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let userId = null
    let userEmail = null

	before( async () =>  {
        await connectDb()
		initializeApi()
        let result = await createUserAccount({password: PASSWORD})
        userId = result.id
        userEmail = result.email
	}),

    after( async () =>  {
        await deleteUserAccountById(userId)
        await disconnectDb()
        await terminateApi()
    })

    it ('Get profile with valid access token', async () => {
        const result = await api.account.getProfile()
        expect(result).to.be.instanceOf(Object)
        expect(result).to.have.property('id')
        expect(result.id).to.be.a('number')
        expect(result).to.have.property('email')
        expect(result.email).to.be.a('string')
        expect(result.state).to.be.a('number').and.to.equal(1) // ACTIVE
    })

    it ('Get profile with expired access token', async () => {
        try {
            const result = await api.account.getProfile({expiredAccessTokenEmulation:true})
            expect.fail('Expired token not detected')
        }
        catch(error) {
            expect(error).to.be.an('error')
            expect(error).to.have.property('message', 'Invalid access token (Expired access token)')
            expect(error).to.have.property('errorId', 'InvalidRequestError')
        }
    })

})
