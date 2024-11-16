'use strict'
import { expect } from 'chai'

import { api, initializeApi, terminateApi, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccountById } from './helpers.js'

describe('Check login', () => {
    let user = null

	before( async () =>  {
        await connectDb()
		initializeApi()
        user = await createUserAccount({withCompany: true})
	}),

    after( async () =>  {
        await deleteUserAccountById(user.id)
        await disconnectDb()
        await terminateApi()
    })


    describe('Check unit functions', () => {

        it ('Create unit', async () => {
            const UNIT_NAME = 'First Unit'
            const unit = await api.unit.createUnit({
                name: UNIT_NAME
            })
            expect(unit).to.be.instanceOf(Object)
            expect(unit).to.have.property('id')
            expect(unit).to.have.property('name', UNIT_NAME)
            expect(unit).to.have.property('companyId')
        })


    })
 
})
