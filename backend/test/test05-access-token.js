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

    const PASSWORD = '4BC+d3f-6H1.lMn!'
    let user = null
    let cpyAccessToken
    let cpyRefreshToken

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({password: PASSWORD})
    }),

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_LOGIN} with valid data`, () => {

        it('Check profile access', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.keys(userPublicProperties)
            expect(user.email).to.be.a('string').and.to.equal(user.email)
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
                expect(error.message).to.equal('Server status 401 ({"error":"Expired access token","refresh-token":null,"access-token":null})')
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
                expect(error.message).to.equal('Server status 400 ({"error":"Parameter «token» not found in request body"})')
            }
        })

        it('Try to call refresh route with invalid token', async () => {
            try {
                const json = await jsonPost(ROUTE_REFRESH, {token:123})
                expect.fail('Invalid refresh token not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Invalid value for «token» parameter in request body"})')
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
                expect(error.message).to.equal('Server status 401 ({"error":"Invalid token"})')
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
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.keys(userPublicProperties)
            expect(user.email).to.be.a('string').and.to.equal(user.email)
            cpyAccessToken = accessToken
            cpyRefreshToken = refreshToken
        })

        it('Check profile access with new token', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.keys(userPublicProperties)
            expect(user.email).to.be.a('string').and.to.equal(user.email)
        })


    })

})


