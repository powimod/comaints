'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_VALIDATE = 'api/v1/auth/validateRegistration'

describe('Test user registration', () => {

	before( async () =>  {
		loadConfig()
		await connectDb()
	}),
	after( async () =>  {
		await disconnectDb()
	}),

	describe('Test root', () => {
        it("check user table", async () => {
            const userList = await requestDb('select * from users')
            expect(userList).to.be.instanceOf(Array)
            if (userList.length > 0) {
                const user = userList[0]
                expect(user).to.be.instanceOf(Object)
                expect(user).to.have.property('id')
            }
        })
	})
        
})
