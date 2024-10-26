'use strict'
import { expect } from 'chai'

import { initializeApi } from './util.js'

describe('Check login', () => {

    let api = null

	before( () =>  {
		api = initializeApi()
	}),

    describe('Check login with missing arguments', () => {
        it ('Check login with missing email argument', async () => {
            try {
                await api.auth.login()
                expect.fail('Missing email argument not detected')
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Argument «email» not defined')
            }
        })
        it ('Check login with missing password argument', async () => {
            try {
                await api.auth.login('abc')
                expect.fail('Missing password argument not detected')
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Argument «password» not defined')
            }
        })
    })

    describe('Check login with invalid arguments', () => {
        it ('Check login with malformed email argument', async () => {
            try {
                await api.auth.login('abc', 'def')
                expect.fail('Invalid email argument not detected')
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Property «email» is not a valid email')
            }
        })
        it ('Check login with bad email argument', async () => {
            try {
                await api.auth.login('a@b.c', 'def')
                expect.fail('Invalid password argument not detected')
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Password is too small')
            }
        })

    })

})
