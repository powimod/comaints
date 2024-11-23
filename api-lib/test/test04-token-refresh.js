'use strict';
import { expect } from 'chai';

import { api, initializeApi, terminateApi, connectDb, disconnectDb, accessToken, refreshToken } from './util.js';
import { createUserAccount, deleteUserAccountById } from './helpers.js';

describe('Check token refresh', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!';
    let userId = null;
    let userEmail = null;
    let accessTokenMemo = null;
    let refreshTokenMemo = null;

	before( async () =>  {
        await connectDb();
		initializeApi();
        let result = await createUserAccount({password: PASSWORD});
        userId = result.id;
        userEmail = result.email;
	}),

    after( async () =>  {
        await deleteUserAccountById(userId);
        await disconnectDb();
        await terminateApi();
    });

    it ('Check tokens', async () => {
        expect(accessToken).not.to.equal(null);
        expect(refreshToken).not.to.equal(null);
    });

    it ('Get profile with valid access token', async () => {
        const result = await api.account.getProfile();
        expect(result).to.be.instanceOf(Object);
        expect(result).to.have.property('id');
        expect(result.id).to.be.a('number');
        expect(result).to.have.property('email');
        expect(result.email).to.be.a('string');
        expect(result.state).to.be.a('number').and.to.equal(1); // ACTIVE
    });

    it ('Check tokens', async () => {
        expect(accessToken).not.to.equal(null);
        expect(refreshToken).not.to.equal(null);
        accessTokenMemo = accessToken;
        refreshTokenMemo = refreshToken;
    });

    it ('Get profile with expired access token', async () => {
        // access with expired token will not generate an error because
        // refresh token will be used to renew access token
        // and API request will be successfull
        const result = await api.account.getProfile({expiredAccessTokenEmulation:true});
        expect(result).to.be.instanceOf(Object);
        expect(result).to.have.keys('id', 'email', 'firstname', 'lastname', 'state', 'lastUse', 'administrator', 'manager', 'companyId');
        expect(result.id).to.be.a('number');
        expect(result.email).to.be.a('string').and.to.equal(userEmail);
        expect(result.firstname).to.equal(null);
        expect(result.lastname).to.equal(null);
        expect(result.state).to.equal(1); // ACTIVE
        expect(result.lastUse).to.equal(null);
        expect(result.administrator).to.be.a('boolean').and.to.equal(false);
        expect(result.companyId).to.equal(null);
    });

    it ('Check token changes', async () => {
        expect(accessToken).not.to.equal(null); 
        expect(refreshToken).not.to.equal(null); 
        // check access token and refresh tokens where renewed
        expect(accessToken).not.to.equal(accessTokenMemo);
        expect(refreshToken).not.to.equal(refreshTokenMemo);
    });

});
