
import {expect} from 'chai';

import {loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, refreshToken, accessToken} from './util.js';
import {createUserAccount, deleteUserAccount, userPublicProperties} from './helpers.js';


const ROUTE_LOGIN = 'api/v1/auth/login';
const ROUTE_LOGOUT = 'api/v1/auth/logout';
const ROUTE_REFRESH = 'api/v1/auth/refresh';
const ROUTE_PROFILE = 'api/v1/account/profile';

describe('Test user login', () => {

    const dte = new Date();
    const userEmail1 = `u${dte.getTime()}-a@x.y`;
    const userEmail2 = `u${dte.getTime()}-b@x.y`;

    const PASSWORD = '4BC+d3f-6H1.lMn!';
    let user1 = null;
    let user2 = null;
    let cpyAccessToken;
    let cpyRefreshToken;

    before(async () => {
        loadConfig();
        await connectDb();
        user1 = await createUserAccount({email: userEmail1, password: PASSWORD, logout: true});
        user2 = await createUserAccount({email: userEmail2, password: PASSWORD, logout: true});
    }),

        after(async () => {
            await deleteUserAccount(user1);
            await deleteUserAccount(user2);
            await disconnectDb();
        }),

        describe(`Call route /${ROUTE_LOGIN}`, () => {

            it('Call login route', async () => {
                let json = await jsonPost(ROUTE_LOGIN, {
                    email: userEmail1,
                    password: PASSWORD
                });
                expect(json).to.be.instanceOf(Object).and.to.have.keys('context', 'message', 'access-token', 'refresh-token');
                expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected',
                    'administrator', 'company');
                expect(json.context.email).to.be.a('string').and.to.equal(userEmail1);
                expect(json.context.connected).to.be.a('boolean').and.to.equal(true);
                expect(json.context.administrator).to.be.a('boolean').and.to.equal(false);
                expect(json.context.company).to.be.a('boolean').and.to.equal(false);
                expect(json['access-token']).to.be.a('string').and.to.have.length.above(0);
                expect(json['refresh-token']).to.be.a('string').and.to.have.length.above(0);
                // check token in util.js
                expect(accessToken).not.to.equal(null);
                expect(refreshToken).not.to.equal(null);
            });

            it('Check profile access', async () => {
                const json = await jsonGet(ROUTE_PROFILE);
                expect(json).to.be.instanceOf(Object);
                expect(json).to.have.property('profile');
                const user1 = json.profile;
                expect(user1).to.be.instanceOf(Object);
                expect(user1).to.have.keys(userPublicProperties);
                expect(user1.email).to.be.a('string').and.to.equal(userEmail1);
                cpyAccessToken = accessToken;
                cpyRefreshToken = refreshToken;
            });

            it('Try to access with emulation of an expired token', async () => {
                try {
                    await jsonGet(ROUTE_PROFILE, {expiredAccessTokenEmulation: true});
                    expect.fail('Expired token emulation not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Expired token');
                    expect(accessToken).to.equal(null); // access token reset
                    expect(refreshToken).not.to.equal(null); // refresh token still present
                }
            });


            it('Try to call refresh route without token', async () => {
                try {
                    await jsonPost(ROUTE_REFRESH, {});
                    expect.fail('Refresh token absence not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Parameter «token» not found in request');
                }
            });

            it('Try to call refresh route with invalid token', async () => {
                try {
                    await jsonPost(ROUTE_REFRESH, {token: 123});
                    expect.fail('Invalid refresh token not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Invalid value for «token» parameter in request');
                }
            });

            it('Try to call refresh route with invalid token', async () => {
                const badToken = "EYjhbGciOiJIUzI1NiIsZXhwIjoxNzYwMTE4MjI2fQ.W_p6K5kHiDO_TU4WGmq3955wrmtYTNLUyF2Vol--Ryk";
                try {
                    await jsonPost(ROUTE_REFRESH, {token: badToken});
                    expect.fail('Invalid refresh token not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Invalid token');
                }
            });


            it('Refresh access token', async () => {
                const json = await jsonPost(ROUTE_REFRESH, {token: cpyRefreshToken});
                expect(json).to.be.instanceOf(Object);

                expect(json).to.have.keys('access-token', 'refresh-token', 'message');
                expect(json.message).to.be.a('string').and.to.equal('token refresh done');

                const newAccessToken = json['access-token'];
                expect(newAccessToken).to.be.a('string').and.to.have.length.above(0);
                expect(newAccessToken !== cpyAccessToken);

                const newRefreshToken = json['refresh-token'];
                expect(newRefreshToken).to.be.a('string').and.to.have.length.above(0);
                expect(newRefreshToken !== cpyRefreshToken);

                // check HTTP header tokens
                expect(accessToken === newAccessToken);
                expect(refreshToken === newRefreshToken);

            });

            it('Check profile access', async () => {
                const json = await jsonGet(ROUTE_PROFILE);
                expect(json).to.be.instanceOf(Object);
                expect(json).to.have.property('profile');
                const user1 = json.profile;
                expect(user1).to.be.instanceOf(Object);
                expect(user1).to.have.keys(userPublicProperties);
                expect(user1.email).to.be.a('string').and.to.equal(userEmail1);
                cpyAccessToken = accessToken;
                cpyRefreshToken = refreshToken;
            });

            it('Check profile access with new token', async () => {
                const json = await jsonGet(ROUTE_PROFILE);
                expect(json).to.be.instanceOf(Object);
                expect(json).to.have.keys('profile');
                const user1 = json.profile;
                expect(user1).to.be.instanceOf(Object);
                expect(user1).to.have.keys(userPublicProperties);
                expect(user1.email).to.be.a('string').and.to.equal(user1.email);
            });
        });

    describe(`Call route /${ROUTE_LOGIN}`, () => {

        it('Call logout route being connected', async () => {
            let json = await jsonPost(ROUTE_LOGOUT);
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

        it('Call logout route not being connected', async () => {
            try {
                await jsonPost(ROUTE_LOGOUT);
                expect.fail('Being already disconnected not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('User is not logged in');
                expect(accessToken).to.equal(null);
                expect(refreshToken).to.equal(null);
            }
        });

        it('Call login route with first account and a bad password', async () => {
            try {
                await jsonPost(ROUTE_LOGIN, {
                    email: userEmail1,
                    password: PASSWORD + 'Z'
                });
                expect.fail('Bad password not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid EMail or password');
                expect(accessToken).to.equal(null);
                expect(refreshToken).to.equal(null);
            }
        });

        it('Call login route with second account and a bad password', async () => {
            try {
                await jsonPost(ROUTE_LOGIN, {
                    email: userEmail2,
                    password: PASSWORD + 'Z'
                });
                expect.fail('Bad password not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid EMail or password');
                expect(accessToken).to.equal(null);
                expect(refreshToken).to.equal(null);
            }
        });
    });

});


