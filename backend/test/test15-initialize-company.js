'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'

const ROUTE_INITIALIZE_COMPANY= 'api/v1/company/initialize'
const ROUTE_PROFILE = 'api/v1/account/profile'
const ROUTE_LOGOUT = 'api/v1/auth/logout'

describe('Test reset password', () => {

    let user = null
    let company = null
    let initialRefreshToken = null
    let initialAccessToken = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount()
        initialRefreshToken = refreshToken
        initialAccessToken = accessToken
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })


    describe(`Call route /${ROUTE_INITIALIZE_COMPANY} with invalid data`, () => {

        it(`Should detect missing company name in request`, async () => {
            try {
                await jsonPost(ROUTE_INITIALIZE_COMPANY, {})
                expect.fail("Missing parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Parameter «companyName» not found in request`)
            }
        })

        it(`Should detect invalid company name in request`, async () => {
            try {
                await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName: 123})
                expect.fail("Invalid company name not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Property «name» is not a string`)
            }
        })

        it(`Should detect empty company name in request`, async () => {
            try {
                await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName: ''})
                expect.fail("Empty company name not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Property «name» is too short`)
            }
        })

    })


    describe(`Call route /${ROUTE_INITIALIZE_COMPANY} with valid data`, () => {

        it(`Check initial tokens`, async () => {
            expect(refreshToken).to.equal(initialRefreshToken)
            expect(accessToken).to.equal(initialAccessToken)
        })

        it(`Initialize company`, async () => {
            const companyName = 'abc'
            let json = await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName})
            expect(json).to.be.instanceOf(Object).and.to.have.keys('company', 'access-token', 'refresh-token', 'context')
            company = json.company
            expect(company).to.be.instanceOf(Object).and.to.have.keys('id', 'name')
            expect(company.id).to.be.a('number')
            expect(company.name).to.be.a('string').and.to.equal(companyName)
            let context = json.context
            expect(context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(context.email).to.equal(user.email)
            expect(context.connected).to.equal(true)
            expect(context.administrator).to.equal(false)
            expect(context.company).to.equal(true)
        })

        it('Control user company', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('profile')
            const profile = json.profile
            expect(profile).to.be.instanceOf(Object)
            expect(profile).to.have.property('companyId')
            expect(profile.companyId).to.equal(company.id)
        })

        it(`Check tokens renew`, async () => {
            expect(refreshToken).not.to.equal(initialRefreshToken)
            expect(accessToken).not.to.equal(initialAccessToken)
        })

        it(`Try to initialize company twice`, async () => {
            try {
                await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName: 'def'})
                expect.fail("Second call not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Company already initialized`)
            }
        })

        it('Call logout route being connected', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {})
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message')
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company')
            expect(json.context.connected).to.be.a('boolean').and.to.equal(false)
            expect(json.context.company).to.be.a('boolean').and.to.equal(false)
            expect(json.message).to.be.a('string').and.to.equal('logout success')
        })

         it(`Try to initialize company without being connected`, async () => {
            try {
                await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName: 'def'})
                expect.fail("Unauthorized call not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Unauthorized access`)
            }
        })

    })

})


