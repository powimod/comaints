'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb } from './util.js'

const ROUTE_REGISTER = 'api/v1/auth/register'
const ROUTE_VALIDATE = 'api/v1/auth/validateRegistration'

describe('Test user registration', () => {

    const dte = new Date()
    const userEmail = `u${dte.getTime()}@x.y`

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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
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
                let json = await jsonPost(ROUTE_REGISTER, {
                        email:'a@b.c',
                        password_missing:''
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
                        password:'abc'
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
                        password:'abcdefghijk9.'
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
                        password:'aBcdefghijkl.'
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
                        password:'aBcdefghijkl9'
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
                    password:'aBcdef+ghijkl9'
            })
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('user')
            const user = json.user
            expect(user).to.be.instanceOf(Object)

            expect(user).to.have.property('id')
            expect(user.id).to.a('number').and.to.be.above(0)
            expect(user).to.have.property('email')
            expect(user.email).to.a('string').and.to.equal(userEmail)
            expect(user).to.have.property('firstname')
            expect(user.firstname).to.equal(null)
            expect(user).to.have.property('lastname')
            expect(user.lastname).to.equal(null)
            expect(user).to.have.property('accountLocked')
            expect(user.accountLocked).to.a('boolean').and.to.equal(true)
            expect(user).to.have.property('administrator')
            expect(user.administrator).to.a('boolean').and.to.equal(false)

            expect(user).not.to.have.property('validationCode')
            expect(user).not.to.have.property('password')

            //console.log(user)
            /*
            {
                  id: 101,
                      id_company: null,
                      email: 'u1728130707175@x.y',
                      password: 'aBcdef+ghijkl9',
                      firstname: null,
                      lastname: null,
                      account_locked: 0,
                      validation_code: 0,
                      active: 1,
                      last_use: null,
                      administrator: 0
            }
            */
             


        })

        it('Check registration attempt with an existing email', async () => {
            try {
                let json = await jsonPost(ROUTE_REGISTER, {
                        email:userEmail,
                        password:'aBcdef+ghijkl9'
                    })
                expect.fail('Invalid «password» parameter not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Server status 409 (Duplicated «email» field for object «user»)')
            }
        })


        /* TODO cleanup
        it("check user table", async () => {
            const userList = await requestDb('select * from users')
            expect(userList).to.be.instanceOf(Array)
            if (userList.length > 0) {
                const user = userList[0]
                expect(user).to.be.instanceOf(Object)
                expect(user).to.have.property('id')
            }
        })
        */
    })
    // TODO test registration with an existing email
        
})
