'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'


const ROUTE_LOGIN    = 'api/v1/auth/login'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'
const ROUTE_PROFILE  = 'api/v1/account/profile'

const ROUTE_CHANGE_PASSWORD = 'api/v1/account/change-password'

describe('Test account routes', () => {

    const CURRENT_PASSWORD = '4BC+d3f-6H1.lMn!'
    const NEW_PASSWORD = '3aK+E3g-6H3+zYg.'

    let user = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({password: CURRENT_PASSWORD})
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),

    it('Check profile access', async () => {
        const json = await jsonGet(ROUTE_PROFILE)
        expect(json).to.be.instanceOf(Object)
        expect(json).to.have.property('user')
        const user = json.user
        expect(user).to.be.instanceOf(Object)
        expect(user).to.have.property('email')
        expect(user.email).to.be.a('string').and.to.equal(user.email)
    })


    describe('Call change password route with invalid data', () => {
        it('Try to call change password without data', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {})
                expect.fail('Call with no data not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Parameter «currentPassword» not found in request body"})')
            }
        })

        it('Try to call change password without invalid current password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword:123, newPassword: NEW_PASSWORD})
                expect.fail('Call with invalid password')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Invalid value for «currentPassword» parameter in request body"})')
            }
        })

        it('Try to call change password without empty current password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword:'', newPassword: NEW_PASSWORD})
                expect.fail('Call with empty current password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password is too small"})')
            }
        })

        it('Try to call change password without invalid new password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: CURRENT_PASSWORD, newPassword:123})
                expect.fail('Call with invalid password')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Invalid value for «newPassword» parameter in request body"})')
            }
        })

        it('Try to call change password without empty new password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: CURRENT_PASSWORD, newPassword:''})
                expect.fail('Call with empty new password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password is too small"})')
            }
        })


        it('Try to call change password without bad current password', async () => {
            const BAD_CURRENT_PASSWORD = `${CURRENT_PASSWORD}+X`
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: BAD_CURRENT_PASSWORD, newPassword:NEW_PASSWORD})
                expect.fail('Call with bad current password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 401 ({"error":"Invalid password"})')
            }
        })
    })

    describe('Call change password route with valid data', () => {

        it('Try to call change password without empty password', async () => {
            const json = await jsonPost(ROUTE_CHANGE_PASSWORD , { currentPassword:CURRENT_PASSWORD, newPassword:NEW_PASSWORD })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('message')
            expect(json.message).to.be.a('string').and.to.equal('Password changed')
        })

        it('Call logout route', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('userId')
            expect(json.userId).to.equal(null)
            expect(json).to.have.property('access-token')
            expect(json['access-token']).to.equal(null)
            expect(json).to.have.property('refresh-token')
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
                expect(error.message).to.equal('Server status 401 ({"error":"Unauthorized"})')
            }
        })

        it('Try to login with old password', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE)
                expect.fail('Login with old password did not failed')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 401 ({"error":"Unauthorized"})')
            }
        })


        it('Login with new password', async () => {
            let json = await jsonPost(ROUTE_LOGIN, {
                    email:user.email,
                    password: NEW_PASSWORD
                })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('access-token')
            expect(json['access-token']).to.be.a('string')
            expect(json).to.have.property('refresh-token')
            expect(json['refresh-token']).to.be.a('string')
            // check token in util.js
            expect(accessToken).not.to.equal(null)
            expect(refreshToken).not.to.equal(null)
        })

        it('Get profile', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.property('email')
            expect(user.email).to.be.a('string').and.to.equal(user.email)
        })

    })
})


