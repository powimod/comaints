'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { userPublicProperties } from './helpers.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_VALIDATE = 'api/v1/auth/validate'
const ROUTE_LOGOUT   = 'api/v1/auth/logout'
const ROUTE_PROFILE  = 'api/v1/account/profile'

describe('Test user registration', () => {

    let authCode  = null
    const dte = new Date()

    const userEmail = `u${dte.getTime()}@x.y`
    let userId = null
    const userEmail2 = `u${dte.getTime()}2@x.y`
    let userId2 = null
    const userEmail3 = `u${dte.getTime()}3@x.y`
    let userId3 = null

    before( async () =>  {
        loadConfig()
        await connectDb()
    }),

    after( async () =>  {
        /* TODO reactivate this
        await requestDb('DELETE FROM users WHERE email=?', userEmail)
        await requestDb('DELETE FROM users WHERE email=?', userEmail2)
        await requestDb('DELETE FROM users WHERE email=?', userEmail3)
        */
        await disconnectDb()
    }),

    describe(`Call route /${ROUTE_REGISTER} with invalid data`, () => {

        it(`Should detect missing email in request body`, async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email_missing:'',
                        password:'',
                        sendCodeByEmail: false
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Parameter «email» not found in request body"})`)
            }
        })


        it(`Should detect empty email in request body`, async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'',
                        password:'',
                        sendCodeByEmail: false
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Property «email» is too short"})`)
            }
        })

        it(`Should detect malformed email in request body`, async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'abcdef',
                        password:'',
                        sendCodeByEmail: false
                    })
                expect.fail("Missing «email» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Property «email» is not a valid email"})`)
            }
        })


        it('Should detect missing password in request body', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password_missing:'',
                        sendCodeByEmail: false
                    })
                expect.fail('Missing «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Parameter «password» not found in request body"})')
            }
        })

        it('Should detect too small password in request body', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password:'abc',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password is too small"})')
            }
        })

        it('Should detect password with no uppercase letter in request body', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password:'abcdefghijk9.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password does not contain uppercase letter"})')
            }
        })

        it('Should detect password with no digit character in request body', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password:'aBcdefghijkl.',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password does not contain digit character"})')
            }
        })

        it('Should detect password with no special character in request body', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password:'aBcdefghijkl9',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 400 ({"error":"Password does not contain special character"})')
            }
        })
    })


    describe(`Test route /${ROUTE_REGISTER} with valid data`, () => {

        it('User regisration', async () => {
            const json = await jsonPost(ROUTE_REGISTER, {
                email:userEmail,
                password:'aBcdef+ghijkl9',
                sendCodeByEmail: false
            })
            expect(json).to.have.keys('access-token', 'refresh-token')
            expect(json['access-token']).to.be.a('string')
            expect(json['refresh-token']).to.be.a('string')
        })

        it('Check registration attempt with an existing email', async () => {
            try {
                const json = await jsonPost(ROUTE_REGISTER, {
                        email:userEmail,
                        password:'aBcdef+ghijkl9',
                        sendCodeByEmail: false
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 409 ({"error":"Duplicated «email» field for object «user»"})')
            }
        })

        it('Check newly created user in database', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            userId = user.id
            expect(userId).to.a('number').and.to.be.above(0)
            expect(user).to.have.property('email')
            expect(user.email).to.a('string').and.to.equal(userEmail)
            expect(user).to.have.property('firstname')
            expect(user.firstname).to.equal(null)
            expect(user).to.have.property('lastname')
            expect(user.lastname).to.equal(null)
            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(0) // pending
            expect(user).to.have.property('administrator')
            expect(user.administrator).to.a('number').and.to.equal(0) // false

            // control auth_code first to initialize authCode
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code
            expect(authCode).to.be.a('number').and.to.be.above(0)

            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.a('string').and.to.equal('register')
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.a('number').and.to.be.equal(0)
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)

            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).not.to.be.equal(null)
            expect(user.auth_expiration).to.be.a('Date')
 
            const expirationDate = user.auth_expiration
            expect(expirationDate).not.to.be.equal(null)
            expect(expirationDate).to.be.a('Date')
            const now = new Date()
            const delta = expirationDate - now
            expect(delta).to.be.at.above(0)
        })

        it('Try to access profile without being logged in', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE)
                expect.fail('Profile access without being connected was not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 401 ({"error":"Unauthorized"})')
            }
        })

        it('Try to validate registration without code', async () => {
            try {
                const json = await jsonPost(ROUTE_VALIDATE, {})
                expect.fail("Missing «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Parameter «code» not found in request body"})`)
            }
        })

        it('Try to validate registration with invalid code', async () => {
            try {
                const json = await jsonPost(ROUTE_VALIDATE, { code: 'abcd' })
                expect.fail("Invalid «code» parameter not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Invalid value for «code» parameter in request body"})`)
            }
        })

        it('Try to validate registration with too large code', async () => {
            try {
                const json = await jsonPost(ROUTE_VALIDATE, { code: 1234567 })
                expect.fail("Too large code not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 ({"error":"Property «authCode» is too large"})`)
            }
        })


        it('Send incorrect validation code', async () => {
            const incorrectCode = authCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { code: incorrectCode })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
            expect(json).to.have.property('userId')
            expect(json.userId).to.be.a('number').and.to.equal(userId)
        })

        it('Send validation code', async () => {
            const json = await jsonPost(ROUTE_VALIDATE, { code: authCode})
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(true)
            expect(json).to.have.property('userId')
            expect(json.userId).to.be.a('number').and.to.equal(userId)
        })

        it('Check newly registered user in database', async () => {
            const res = await requestDb('select * from users where id=?', [ userId ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            userId = user.id
            expect(userId).to.a('number').and.to.be.above(0)
            expect(user).to.have.property('email')
            expect(user.email).to.a('string').and.to.equal(userEmail)
            expect(user).to.have.property('firstname')
            expect(user.firstname).to.equal(null)
            expect(user).to.have.property('lastname')
            expect(user.lastname).to.equal(null)
            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(1) // active
            expect(user).to.have.property('administrator')
            expect(user.administrator).to.a('number').and.to.equal(0)

            expect(user).to.have.property('auth_code')
            expect(user.auth_code).to.equal(null)

            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.to.equal(null)
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.equal(null)
            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).to.be.equal(null)
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)
        })


        it('Check profile access when connected', async () => {
            const json = await jsonGet(ROUTE_PROFILE)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.keys(userPublicProperties)
            expect(user.id).to.be.a('number')
            expect(user.email).to.be.a('string').and.to.equal(userEmail)
            expect(user.state).to.be.a('number').and.to.equal(1) // active
        })

    })

    describe(`Test route /${ROUTE_LOGOUT}`, () => {

        it('Call logout route being connected', async () => {
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

        it('Check profile access when disconnected', async () => {
            const res = await requestDb('select * from users where id=?', [ userId ])
            const user = res[0]
            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.equal(null)
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.equal(null)
            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).to.be.equal(null)
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)
        })


        it('Call logout without being connected', async () => {
            try {
                await jsonPost(ROUTE_LOGOUT, {})
                expect.fail("Calling logout route without connection was not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 401 ({"error":"User is not logged in"})`)
            }
        })
    })

    describe(`Check registration with too many attempts`, () => {

        // register
        it('User regisration', async () => {
            const json = await jsonPost(ROUTE_REGISTER, {
                email:userEmail2,
                password:'aBcdef+ghijkl9',
                sendCodeByEmail: false
            })
            expect(json).to.have.keys('access-token', 'refresh-token')
            expect(json['access-token']).to.be.a('string')
            expect(json['refresh-token']).to.be.a('string')
        })

        it('Check newly created user in database', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail2 ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            userId2 = user.id

            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(0) // pending

            // control auth_code first to initialize authCode
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code
            expect(authCode).to.be.a('number').and.to.be.above(0)
            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.a('string').and.to.equal('register')
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.a('number').and.to.be.equal(0)
            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).not.to.be.equal(null)
            expect(user.auth_expiration).to.be.a('Date')
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)
        })

 
        //───────────── First attempt
        it('First attempt to confirm registration with an invalid code', async () => {
            const incorrectCode = authCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { code: incorrectCode })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
            expect(json).to.have.property('userId')
            expect(json.userId).to.be.a('number').and.to.equal(userId2)
        })

        it('Check user in database after first attempt', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail2 ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            userId2 = user.id

            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(0) // pending

            // control auth_code first to initialize authCode
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code
            expect(authCode).to.be.a('number').and.to.be.above(0)
            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.a('string').and.to.equal('register')
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.a('number').and.to.be.equal(1)
            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).not.to.be.equal(null)
            expect(user.auth_expiration).to.be.a('Date')
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)
        })

        //───────────── Second attempt
        it('Second attempt to confirm registration with an invalid code', async () => {
            const incorrectCode = authCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { code: incorrectCode })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
            expect(json).to.have.property('userId')
            expect(json.userId).to.be.a('number').and.to.equal(userId2)
        })

        it('Check user in database after second attempt', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail2 ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.a('number').and.to.be.equal(2)

            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(0) // pending
        })


        //───────────── Third attempt
        it('Third attempt to confirm registration with an invalid code', async () => {
            const incorrectCode = authCode + 1
            const json = await jsonPost(ROUTE_VALIDATE, { code: incorrectCode })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('validated')
            expect(json.validated).to.be.a('boolean').and.to.equal(false)
            expect(json).to.have.property('userId')
            expect(json.userId).to.be.a('number').and.to.equal(userId2)
        })

        it('Check user in database after third attempt', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail2 ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code

            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(3) // locked

            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.equal(null)
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.equal(null)
            expect(user).to.have.property('auth_expiration')
            expect(user.auth_expiration).to.equal(null)
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.equal(null)
            expect(user).to.have.property('auth_code')
            expect(user.auth_code).to.equal(null)

            authCode = user.auth_code
        })

    })

    describe(`Test to send the code after the maximum delay`, () => {

        it('User regisration', async () => {
            const json = await jsonPost(ROUTE_REGISTER, {
                email:userEmail3,
                password:'aBcdef+ghijkl9',
                sendCodeByEmail: false,
                invalidateCodeImmediately: true // set code validity to zero
            })
            expect(json).to.have.keys('access-token', 'refresh-token')
            expect(json['access-token']).to.be.a('string')
            expect(json['refresh-token']).to.be.a('string')
        })

        it('Check newly created user in database', async () => {
            const res = await requestDb('select * from users where email=?', [ userEmail3 ])
            expect(res).to.be.instanceOf(Array)
            const user = res[0]
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            userId3 = user.id

            expect(user).to.have.property('state')
            expect(user.state).to.a('number').and.to.equal(0) // pending

            // control auth_code first to initialize authCode
            expect(user).to.have.property('auth_code')
            authCode = user.auth_code
            expect(authCode).to.be.a('number').and.to.be.above(0)
            expect(user).to.have.property('auth_action')
            expect(user.auth_action).to.be.a('string').and.to.equal('register')
            expect(user).to.have.property('auth_attempts')
            expect(user.auth_attempts).to.be.a('number').and.to.be.equal(0)
            expect(user).to.have.property('auth_expiration')
            expect(user).to.have.property('auth_data')
            expect(user.auth_data).to.be.equal(null)

            const expirationDate = user.auth_expiration
            expect(expirationDate).not.to.be.equal(null)
            expect(expirationDate).to.be.a('Date')
            const now = new Date()
            const delta = expirationDate - now
            expect(delta).to.be.at.most(0)
        })

        it('Send validation code after code expiration', async () => {
            try {
                const json = await jsonPost(ROUTE_VALIDATE, { code: authCode })
                expect.fail("Code expiration was not detected")
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 401 ({"error":"Expired code"})`)
            }
        })
    })
        
})
