'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserByEmail } from './helpers.js'


const ROUTE_LOGIN = 'api/v1/auth/login'
const ROUTE_LOGOUT = 'api/v1/auth/logout'
const ROUTE_PROFILE = 'api/v1/account/profile'

describe('Test user login', () => {

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
                expect(error.message).to.equal(`Parameter «email» not found in request body`)
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
                expect(error.message).to.equal(`Property «email» is too short`)
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
                expect(error.message).to.equal(`Property «email» is not a valid email`)
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
                expect(error.message).to.equal('Parameter «password» not found in request body')
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
                expect(error.message).to.equal('Password is too small')
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
                expect(error.message).to.equal('Password does not contain uppercase letter')
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
                expect(error.message).to.equal('Password does not contain digit character')
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
                expect(error.message).to.equal('Password does not contain special character')
            }
        })

    })

    describe(`Call route /${ROUTE_LOGIN} with valid data`, () => {

        it('Try to access profile without being logged in', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE)
                expect.fail('Profile access without being connected was not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Unauthorized access')
            }
        })


        it('Try to login with incorrect password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:user.email,
                        password: `${PASSWORD}+X`
                    })
                expect.fail('Incorrect «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
            }
        })

        it('Login with valid password', async () => {
            let json = await jsonPost(ROUTE_LOGIN, {
                    email:user.email,
                    password: PASSWORD
                })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.keys('access-token', 'refresh-token')
            expect(json['access-token']).to.be.a('string')
            expect(json['refresh-token']).to.be.a('string')
            // check token in util.js
            expect(accessToken).not.to.equal(null)
            expect(refreshToken).not.to.equal(null)
        })
        it('Get user profile', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('profile')
            const profile = json.profile
            expect(profile).to.have.keys(userPublicProperties)
            expect(profile).to.be.instanceOf(Object)
            expect(profile).to.have.property('id')
            expect(profile.id).to.equal(user.id)
            expect(profile.email).to.be.a('string').and.to.equal(user.email)
            expect(profile.state).to.be.a('number').and.to.equal(1) // active
            expect(profile.administrator).to.be.a('boolean').and.to.equal(false)
            expect(profile.companyId).to.equal(null)
        })

        it('Try to login when already logged', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:user.email,
                        password: PASSWORD
                    })
                expect.fail('Second loggin not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('User already connected')
            }
        })

        it('Call logout route being connected', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.have.keys('access-token', 'refresh-token', 'userId')
            expect(json).to.be.instanceOf(Object)
            expect(json.userId).to.equal(null)
            expect(json['access-token']).to.equal(null)
            expect(json['refresh-token']).to.equal(null)
            // check token in util.js
            expect(accessToken).to.equal(null)
            expect(refreshToken).to.equal(null)
        })

        it('Try to access profile when logged out', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE)
                expect.fail('Getting profile when logged out not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Unauthorized access')
            }
        })

         it('Second login with valid password', async () => {
            let json = await jsonPost(ROUTE_LOGIN, {
                    email:user.email,
                    password: PASSWORD
                })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.keys('access-token', 'refresh-token')
            expect(json['access-token']).to.be.a('string')
            expect(json['refresh-token']).to.be.a('string')
            // check token in util.js
            expect(accessToken).not.to.equal(null)
            expect(refreshToken).not.to.equal(null)
        })

        it('Get user profile', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('profile')
            const profile = json.profile
            expect(profile).to.be.instanceOf(Object)
            expect(profile).to.have.keys(userPublicProperties)
            expect(profile.id).to.equal(user.id)
            expect(profile.email).to.be.a('string').and.to.equal(user.email)
            expect(profile.state).to.be.a('number').and.to.equal(1) // active
            expect(profile.administrator).to.be.a('boolean').and.to.equal(false)
            expect(profile.companyId).to.equal(null)
        })

        it('Call logout route', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.keys('access-token', 'refresh-token', 'userId')
            expect(json.userId).to.equal(null)
            expect(json['access-token']).to.equal(null)
            expect(json['refresh-token']).to.equal(null)
            // check token in util.js
            expect(accessToken).to.equal(null)
            expect(refreshToken).to.equal(null)
        })
    })


    describe(`Check too many login attempts detection`, () => {

        //──────── first attempt to login with invalid password
        it('First attempt to login with incorrect password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:user.email,
                        password: `${PASSWORD}+X`
                    })
                expect.fail('Incorrect «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
            }
        })
        it('Check user in database after first login attempt', async () => {
            const dbUser = await getDatabaseUserByEmail(user.email)
            expect(dbUser).to.have.property('auth_action')
            expect(dbUser.auth_action).to.be.a('string').and.to.equal('login')
            expect(dbUser).to.have.property('auth_attempts')
            expect(dbUser.auth_attempts).to.be.a('number').and.to.equal(1)
            expect(dbUser.state).to.be.a('number').and.to.equal(1) // active
        })

        //──────── second attempt to login with invalid password
        it('Second attempt to login with incorrect password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:user.email,
                        password: `${PASSWORD}+X`
                    })
                expect.fail('Incorrect «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
            }
        })
        it('Check user in database after second login attempt', async () => {
            const dbUser = await getDatabaseUserByEmail(user.email)
            expect(dbUser).to.have.property('auth_action')
            expect(dbUser.auth_action).to.be.a('string').and.to.equal('login')
            expect(dbUser).to.have.property('auth_attempts')
            expect(dbUser.auth_attempts).to.be.a('number').and.to.equal(2)
            expect(dbUser.state).to.be.a('number').and.to.equal(1) // active
        })

        //──────── third attempt to login with invalid password
        it('Third attempt to login with incorrect password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                        email:user.email,
                        password: `${PASSWORD}+X`
                    })
                expect.fail('Incorrect «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
            }
        })

        it('Check user account locked', async () => {
            const dbUser = await getDatabaseUserByEmail(user.email)
            expect(dbUser.state).to.be.a('number').and.to.equal(3) // locked
            expect(dbUser.auth_action).to.equal(null)
            expect(dbUser.auth_attempts).to.equal(null)
        })

    })
})


