'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_VALIDATE = 'api/v1/auth/validateRegistration'

describe('Test user registration', () => {

    const dte = new Date()
    const userEmail = `u${dte.getTime()}@x.y`
    let validationCode  = null
    let accessToken = null
    let refreshToken = null

    before( async () =>  {
        loadConfig()
        await connectDb()
    }),

    after( async () =>  {
        await requestDb('DELETE FROM users WHERE email=?', userEmail)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_REGISTER} with invalid data`, () => {

        it(`Should detect missing email in request body`, async () => {
            try {
                let json = await jsonPost(ROUTE_REGISTER, {
                        email_missing:'',
                        password:'',
                        sendCodeByEmail: false
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
                let json = await jsonPost(ROUTE_REGISTER, {
                        email:'',
                        password:'',
                        sendCodeByEmail: false
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
                let json = await jsonPost(ROUTE_REGISTER, {
                        email:'abcdef',
                        password:'',
                        sendCodeByEmail: false
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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
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

    describe(`Call route /${ROUTE_REGISTER} with valid data`, () => {

        it('User regisration', async () => {
            let json = await jsonPost(ROUTE_REGISTER, {
                email:userEmail,
                password:'aBcdef+ghijkl9',
                sendCodeByEmail: false
            })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('access-token')
            accessToken = json['access-token']
            expect(accessToken).to.be.a('string')
            expect(json).to.have.property('refresh-token')
            refreshToken = json['refresh-token']
            expect(refreshToken).to.be.a('string')
        })

        it('Check registration attempt with an existing email', async () => {
            try {
                let json = await jsonPost(ROUTE_REGISTER, {
                        email:userEmail,
                        password:'aBcdef+ghijkl9',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 409 (Duplicated «email» field for object «user»)')
            }
        })

        it('check newly created user in database', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            expect(user.id).to.a('number').and.to.be.above(0)
            expect(user).to.have.property('email')
            expect(user.email).to.a('string').and.to.equal(userEmail)
            expect(user).to.have.property('firstname')
            expect(user.firstname).to.equal(null)
            expect(user).to.have.property('lastname')
            expect(user.lastname).to.equal(null)
            expect(user).to.have.property('account_locked')
            expect(user.account_locked).to.a('number').and.to.equal(1)
            expect(user).to.have.property('administrator')
            expect(user.administrator).to.a('number').and.to.equal(0)

            expect(user).to.have.property('validation_code')
            const validationCode = user.validation_code
            expect(validationCode).to.be.a('number')
        })


        // TODO try to access private route with accesToken while user registration is not finished

        it('Try to validate registration without code', async () => {
            try {
                let json = await jsonPost(ROUTE_VALIDATE, {})
                expect.fail("Missing «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Parameter «code» not found in request body)`)
            }
        })

        it('Try to validate registration with invalid code', async () => {
            try {
                let json = await jsonPost(ROUTE_VALIDATE, { code: 'abcd' })
                expect.fail("Invalid «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Parameter «code» invalid in request body)`)
            }
        })

        it('Try to validate registration with too large code', async () => {
            try {
                let json = await jsonPost(ROUTE_VALIDATE, { code: 1234567 })
                expect.fail("Too large «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Property «validationCode» is too large)`)
            }
        })


        /*
        it('Send incorrect validation code', async () => {
            const incorrectCode = validationCode + 1
            let json = await jsonPost(ROUTE_VALIDATE, { code: incorrectCode })
            console.log(json)
            expect.fail("Missing «code» parameter not detected")
        })


        it('Send validation code', async () => {
            try {
                let json = await jsonPost(ROUTE_VALIDATE, { code })
                expect.fail("Missing «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Parameter «code» not found in request body)`)
            }
        })
        */


    })
    // TODO test registration with an existing email
        
})
