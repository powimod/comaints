'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserByEmail } from './helpers.js'

const ROUTE_LOGIN = 'api/v1/auth/login'
const ROUTE_LOGOUT = 'api/v1/auth/logout'
const ROUTE_RESET_PASSWORD = 'api/v1/auth/reset-password'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_PROFILE = 'api/v1/account/profile'

describe('Test reset password', () => {

    const PASSWORD1 = '4BC+d3f-6H1.lMn!'
    const PASSWORD2 = '3AB+f3d:5z3.lnM.'
    let user = null
    let validationCode = null
    let passwordHash = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({password: PASSWORD1, logout:true})
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_RESET_PASSWORD} with invalid data`, () => {

        it(`Should detect missing email in request`, async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email_missing:'',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Parameter «email» not found in request`)
            }
        })

        it(`Should detect empty email in request`, async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Property «email» is too short`)
            }
        })

        it(`Should detect malformed email in request`, async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'abcdef',
                        password:''
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Property «email» is not a valid email`)
            }
        })

        it('Should detect missing password in request', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'a@b.c',
                        password_missing:'',
                        sendCodeByEmail: false
                    })
                expect.fail('Missing «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Parameter «password» not found in request')
            }
        })


        it('Should detect too small password in request', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'a@b.c',
                        password:'abc',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Password is too small')
            }
        })

        it('Should detect password with no uppercase letter in request', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'a@b.c',
                        password:'abcdefghijk9.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Password does not contain uppercase letter')
            }
        })

        it('Should detect password with no digit character in request', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'a@b.c',
                        password:'aBcdefghijkl.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Password does not contain digit character')
            }
        })

        it('Should detect password with no special character in request', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                        email:'a@b.c',
                        password:'aBcdefghijkl9',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Password does not contain special character')
            }
        })

    })

    describe(`Call route /${ROUTE_RESET_PASSWORD} with valid data`, () => {

         it('Reset password', async () => {
            let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                    email:user.email,
                    password: PASSWORD2,
                    sendCodeByEmail: false
                })
             expect(json).to.be.instanceOf(Object).and.to.have.keys('message')
             expect(json.message).to.be.equal('Password changed, waiting for validation code')
        })

        it('Get auth code from database', async () => {
            const dbUser = await getDatabaseUserByEmail(user.email)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.auth_code).to.be.above(0)
            validationCode = dbUser.auth_code
            passwordHash = dbUser.password
        })

        it('Call route with bad code', async () => {
            const badCode = validationCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { email: user.email, code: badCode})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
        })

        it('Call route with code', async () => {
            const json = await jsonPost(ROUTE_VALIDATE, { email: user.email, code: validationCode})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('validated', 'context', 'access-token', 'refresh-token')

            expect(json.validated).to.be.a('boolean').and.to.equal(true)

            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(json.context.email).to.be.a('string').and.to.equal(user.email)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(true)
            expect(json.context.administrator).to.be.a('boolean').and.to.equal(false)
            expect(json.context.company).to.be.a('boolean').and.to.equal(false)

            expect(json['access-token']).to.be.a('string').and.to.have.length.above(0)
            expect(json['refresh-token']).to.be.a('string').and.to.have.length.above(0)
        })

        it('Chech user changes in database', async () => {
            const dbUser = await getDatabaseUserByEmail(user.email)
            expect(dbUser).to.be.instanceOf(Object)
            expect(dbUser.password).to.have.length.above(0)
            expect(dbUser.password).not.to.equal(passwordHash) // password hash should have change
            expect(dbUser.auth_action).to.equal(null)
            expect(dbUser.auth_data).to.equal(null)
            expect(dbUser.auth_code).to.equal(null)
            expect(dbUser.auth_expiration).to.equal(null)
            expect(dbUser.auth_attempts).to.equal(null)
        })

        it('Get user profile to verify user login', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('profile')
            const profile = json.profile
            expect(profile).to.have.keys(userPublicProperties)
            expect(profile).to.be.instanceOf(Object)
            expect(profile).to.have.property('id')
            expect(profile.id).to.equal(user.id)
            expect(profile.email).to.be.a('string').and.to.equal(user.email)
        })

        it('Call logout route', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message')
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(json.context.email).to.equal(null)
            expect(json.context.connected).to.be.a('boolean').and.to.equal(false)
            expect(json.context.administrator).to.be.a('boolean').and.to.equal(false)
            expect(json.context.company).to.be.a('boolean').and.to.equal(false)
            expect(json.message).to.be.a('string').and.to.equal('logout success')
        })
 

        it('Try to log in with previous password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, { email:user.email, password:PASSWORD1 })
                expect.fail("Wrong password not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Invalid EMail or password`)
            }
        })

        it('Try to log in with new password', async () => {
            let json = await jsonPost(ROUTE_LOGIN, { email:user.email, password:PASSWORD2 })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('message', 'login success')
        })

        it('Get user profile to verify user login', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('profile')
            const profile = json.profile
            expect(profile).to.have.keys(userPublicProperties)
            expect(profile).to.be.instanceOf(Object)
            expect(profile).to.have.property('id')
            expect(profile.id).to.equal(user.id)
            expect(profile.email).to.be.a('string').and.to.equal(user.email)
        })
    })

    describe(`Call route /${ROUTE_RESET_PASSWORD} with non existing email`, () => {
        it('Try to change password with non existing email', async () => {
            try {
                let json = await jsonPost(ROUTE_RESET_PASSWORD, {
                    email: 'non@existing.email',
                    password:PASSWORD1,
                    sendCodeByEmail: false
                })
                // FIXME le message indique que le compte n'existe pas : ça aide pour le piratage
                expect.fail("Non existing email not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`User not found`)
            }
        })
    })

    // TODO test with expired code
})


