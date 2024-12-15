
import { expect } from 'chai';
import assert from 'assert';

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js';
import { createUserAccount, deleteUserAccount, userPublicProperties } from './helpers.js';


const ROUTE_LOGIN    = 'api/v1/auth/login';
const ROUTE_LOGOUT   = 'api/v1/auth/logout';
const ROUTE_PROFILE  = 'api/v1/account/profile';

const ROUTE_CHANGE_PASSWORD = 'api/v1/account/change-password';

describe('Test change password route', () => {

    const CURRENT_PASSWORD = '4BC+d3f-6H1.lMn!';
    const NEW_PASSWORD = '3aK+E3g-6H3+zYg.';

    let user = null;

    before( async () =>  {
        loadConfig();
        await connectDb();
        user = await createUserAccount({password: CURRENT_PASSWORD});
    }),

    after( async () =>  {
        await deleteUserAccount(user);
        await disconnectDb();
    }),

    it('Check profile access', async () => {
        const json = await jsonGet(ROUTE_PROFILE);
        expect(json).to.be.instanceOf(Object);
        expect(json).to.have.property('profile');
        const profile= json.profile;
        expect(profile).to.be.instanceOf(Object);
        expect(profile).to.have.keys(userPublicProperties);
        expect(profile.email).to.be.a('string').and.to.equal(user.email);
    });


    describe('Call change password route with invalid data', () => {
        it('Try to call change password without data', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {});
                expect.fail('Call with no data not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Parameter «currentPassword» not found in request');
            }
        });

        it('Try to call change password without invalid current password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword:123, newPassword: NEW_PASSWORD});
                expect.fail('Call with invalid password');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid value for «currentPassword» parameter in request');
            }
        });

        it('Try to call change password without empty current password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword:'', newPassword: NEW_PASSWORD});
                expect.fail('Call with empty current password not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Password is too small');
            }
        });

        it('Try to call change password without invalid new password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: CURRENT_PASSWORD, newPassword:123});
                expect.fail('Call with invalid password');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid value for «newPassword» parameter in request');
            }
        });

        it('Try to call change password without empty new password', async () => {
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: CURRENT_PASSWORD, newPassword:''});
                expect.fail('Call with empty new password not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Password is too small');
            }
        });


        it('Try to call change password without bad current password', async () => {
            const BAD_CURRENT_PASSWORD = `${CURRENT_PASSWORD}+X`;
            try {
                const json = await jsonPost(ROUTE_CHANGE_PASSWORD , {currentPassword: BAD_CURRENT_PASSWORD, newPassword:NEW_PASSWORD});
                expect.fail('Call with bad current password not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid password');
            }
        });
    });

    describe('Call change password route with valid data', () => {

        it('Try to call change password with new password', async () => {
            const json = await jsonPost(ROUTE_CHANGE_PASSWORD , { currentPassword:CURRENT_PASSWORD, newPassword:NEW_PASSWORD });
            expect(json).to.be.instanceOf(Object);
            expect(json).to.have.property('message');
            expect(json.message).to.be.a('string').and.to.equal('Password changed');
        });

        it('Call logout route', async () => {
            const json = await jsonPost(ROUTE_LOGOUT, {});
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message');
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company');
            expect(json.context.email).to.equal(null);
            expect(json.context.connected).to.be.a('boolean').and.to.equal(false);
            expect(json.context.administrator).to.be.a('boolean').and.to.equal(false);
            expect(json.context.company).to.be.a('boolean').and.to.equal(false);
            expect(json.message).to.be.a('string').and.to.equal('logout success');
            expect(json['access-token']).to.equal(null);
            expect(json['refresh-token']).to.equal(null);
            // check token in util.js
            expect(accessToken).to.equal(null);
            expect(refreshToken).to.equal(null);
        });

        it('Try to access profile when logged out', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE);
                expect.fail('Getting profile when logged out not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Unauthorized access');
            }
        });

        it('Try to login with old password', async () => {
            try {
                const json = await jsonGet(ROUTE_PROFILE);
                expect.fail('Login with old password did not failed');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Unauthorized access');
            }
        });


        it('Login with new password', async () => {
            let json = await jsonPost(ROUTE_LOGIN, {
                    email:user.email,
                    password: NEW_PASSWORD
                });
            expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message');
            expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company');
            expect(json.context.email).to.be.a('string').and.to.equal(user.email);
            expect(json.context.connected).to.be.a('boolean').and.to.equal(true);
            expect(json.context.administrator).to.be.a('boolean').and.to.equal(false);
            expect(json.context.company).to.be.a('boolean').and.to.equal(false);
            expect(json.message).to.be.a('string').and.to.equal('login success');
            expect(json['access-token']).not.to.equal(null);
            expect(json['refresh-token']).not.to.equal(null);
            // check token in util.js
            expect(accessToken).not.to.equal(null);
            expect(refreshToken).not.to.equal(null);
        });

        it('Get profile', async () => {
            const json = await jsonGet(ROUTE_PROFILE);
            expect(json).to.be.instanceOf(Object);
            expect(json).to.have.property('profile');
            const profile = json.profile;
            expect(profile).to.be.instanceOf(Object);
            expect(profile).to.have.keys(userPublicProperties);
            expect(profile.email).to.be.a('string').and.to.equal(user.email);
        });

    });
});


