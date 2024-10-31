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
        const result = await api.account.getProfile({expiredAccessTokenEmulation:true})
        expect(result).to.be.instanceOf(Object)
        expect(result).to.have.keys('id', 'email', 'firstname', 'lastname', 'state', 'lastUse', 'administrator', 'companyId')
        expect(result.id).to.be.a('number')
        expect(result.email).to.be.a('string').and.to.equal(userEmail)
        expect(result.firstname).to.equal(null)
        expect(result.lastname).to.equal(null)
        expect(result.state).to.equal(1) // ACTIVE
        expect(result.lastUse).to.equal(null)
        expect(result.administrator).to.be.a('boolean').and.to.equal(false)
        expect(result.companyId).to.equal(null)
    })

})
