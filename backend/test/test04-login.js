'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'


const ROUTE_LOGIN= 'api/v1/auth/login'

describe('Test user registration', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let user = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({password: PASSWORD, logout:true})
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_LOGIN} with invalid data`, () => {

        it(`Should detect missing email in request body`, async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email_missing:'',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Parameter «email» not found in request body)`)
            }
        })

        it(`Should detect empty email in request body`, async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Property «email» is too short)`)
            }
        })

        it(`Should detect malformed email in request body`, async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'abcdef',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Property «email» is not a valid email)`)
            }
        })

        it('Should detect missing password in request body', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'a@b.c',
                        password_missing:'',
                        sendCodeByEmail: false
                    })
                expect.fail('Missing «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 (Parameter «password» not found in request body)')
            }
        })


        it('Should detect too small password in request body', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'a@b.c',
                        password:'abc',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 (Password is too small)')
            }
        })

        it('Should detect password with no uppercase letter in request body', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'a@b.c',
                        password:'abcdefghijk9.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 (Password does not contain uppercase letter)')
            }
        })

        it('Should detect password with no digit character in request body', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'a@b.c',
                        password:'aBcdefghijkl.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 (Password does not contain digit character)')
            }
        })

        it('Should detect password with no special character in request body', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:'a@b.c',
                        password:'aBcdefghijkl9',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 (Password does not contain special character)')
            }
        })

    })

    /*
    describe(`Call route /${ROUTE_LOGIN} with valid data`, () => {
        //TODO check incorrect password
    })
    */

})


