'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb } from './util.js'
import { connectWithAdminAccount } from './helpers.js'

describe('Test admin', () => {

    before( async () =>  {
        loadConfig()
        await connectDb()
    }),

    after( async () =>  {
        await disconnectDb()
    }),

    it(`Check login with admin account`, async () => {
        const res = await connectWithAdminAccount()
        expect(res).to.be.instanceOf(Object).and.to.have.keys('message', 'context', 'access-token', 'refresh-token')
        expect(res.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator')
        expect(res.context.administrator).to.be.a('boolean').and.to.equal(true)
    })

})


