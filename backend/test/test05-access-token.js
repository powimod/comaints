'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties } from './helpers.js'


const ROUTE_LOGIN    = 'api/v1/auth/login'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'
const ROUTE_REFRESH  = 'api/v1/auth/refresh'
const ROUTE_PROFILE  = 'api/v1/account/profile'

describe('Test user login', () => {

    const dte = new Date()
    const userEmail1 = `u${dte.getTime()}-a@x.y`
    const userEmail2 = `u${dte.getTime()}-b@x.y`

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let user1 = null
    let user2 = null
    let cpyAccessToken
    let cpyRefreshToken

    before( async () =>  {
        loadConfig()
        await connectDb()
        user1 = await createUserAccount({email:userEmail1, password: PASSWORD, logout:true})
        user2 = await createUserAccount({email:userEmail2, password: PASSWORD, logout:true})
    }),

    after( async () =>  {
        await deleteUserAccount(user1)
        await deleteUserAccount(user2)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_LOGIN}`, () => {

        it('Call login route', async () => {
            let json = await jsonPost(ROUTE_LOGIN, {
                    email:userEmail1,
                    password: PASSWORD
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

        it('Check profile access', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user1 = json.user
            expect(user1).to.be.instanceOf(Object)
            expect(user1).to.have.keys(userPublicProperties)
            expect(user1.email).to.be.a('string').and.to.equal(userEmail1)
            cpyAccessToken = accessToken
            cpyRefreshToken = refreshToken
        })

        it('Try to access with emulation of an expired token', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE, { expiredAccessTokenEmulation : true})
                expect.fail('Expired token emulation not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Expired access token')
                expect(accessToken).to.equal(null)
                expect(refreshToken).to.equal(null)
            }
        })


        it('Try to call refresh route without token', async () => {
            try {
                const json = await jsonPost(ROUTE_REFRESH, {})
                expect.fail('Refresh token absence not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Parameter «token» not found in request body')
            }
        })

        it('Try to call refresh route with invalid token', async () => {
            try {
                const json = await jsonPost(ROUTE_REFRESH, {token:123})
                expect.fail('Invalid refresh token not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid value for «token» parameter in request body')
            }
        })

        it('Try to call refresh route with invalid token', async () => {
            const badToken = "EYjhbGciOiJIUzI1NiIsZXhwIjoxNzYwMTE4MjI2fQ.W_p6K5kHiDO_TU4WGmq3955wrmtYTNLUyF2Vol--Ryk"
            try {
                const json = await jsonPost(ROUTE_REFRESH, {token:badToken})
                expect.fail('Invalid refresh token not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid token')
            }
        })



        it('Refresh access token', async () => {
            const json = await jsonPost(ROUTE_REFRESH, {token: cpyRefreshToken})
            expect(json).to.be.instanceOf(Object)

            expect(json).to.have.property('access-token')
            const newAccessToken = json['access-token']
            expect(newAccessToken).to.be.a('string')
            expect(newAccessToken !== cpyAccessToken)

            expect(json).to.have.property('refresh-token')
            const newRefreshToken = json['refresh-token']
            expect(newRefreshToken).to.be.a('string')
            expect(newRefreshToken !== cpyRefreshToken)

            // check HTTP header tokens
            expect(accessToken === newAccessToken)
            expect(refreshToken === newRefreshToken)

        })

        it('Check profile access', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user1 = json.user
            expect(user1).to.be.instanceOf(Object)
            expect(user1).to.have.keys(userPublicProperties)
            expect(user1.email).to.be.a('string').and.to.equal(userEmail1)
            cpyAccessToken = accessToken
            cpyRefreshToken = refreshToken
        })

        it('Check profile access with new token', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user1 = json.user
            expect(user1).to.be.instanceOf(Object)
            expect(user1).to.have.keys(userPublicProperties)
            expect(user1.email).to.be.a('string').and.to.equal(user1.email)
        })
    })

    describe(`Call route /${ROUTE_LOGIN}`, () => {

        it('Call logout route being connected', async () => {
            let json = await jsonPost(ROUTE_LOGOUT)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('access-token')
            expect(json['access-token']).to.equal(null)
            expect(json).to.have.property('refresh-token')
            expect(json['refresh-token']).to.equal(null)
            // check token in util.js
            expect(accessToken).to.equal(null)
            expect(refreshToken).to.equal(null)
        })

        it('Call logout route not being connected', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGOUT)
                expect.fail('Being already disconnected not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('User is not logged in')
                expect(accessToken).to.equal(null)
                expect(refreshToken).to.equal(null)
            }
        })

        it('Call login route with first account and a bad password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                    email:userEmail1,
                    password: PASSWORD + 'Z'
                })
                expect.fail('Bad password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
                expect(accessToken).to.equal(null)
                expect(refreshToken).to.equal(null)
            }
        })

        it('Call login route with second account and a bad password', async () => {
            try {
                let json = await jsonPost(ROUTE_LOGIN, {
                    email:userEmail2,
                    password: PASSWORD + 'Z'
                })
                expect.fail('Bad password not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid EMail or password')
                expect(accessToken).to.equal(null)
                expect(refreshToken).to.equal(null)
            }
        })
    })

})


