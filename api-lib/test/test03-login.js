'use strict';
import { expect } from 'chai';

import { api, initializeApi, terminateApi, connectDb, disconnectDb } from './util.js';
import { createUserAccount, deleteUserAccountById, getDatabaseUserById } from './helpers.js';

describe('Check login', () => {

    const PASSWORD = '4BC+d3f-6H1.lMn!';
    let userId = null;
    let userEmail = null;

	before( async () =>  {
        await connectDb();
		initializeApi();
        let result = await createUserAccount({password: PASSWORD, logout:true});
        userId = result.id;
        userEmail = result.email;
	}),

    after( async () =>  {
        await deleteUserAccountById(userId);
        await disconnectDb();
        await terminateApi();
    });

    describe('Check login with missing arguments', () => {
        it ('Check login with missing email argument', async () => {
            try {
                await api.auth.login();
                expect.fail('Missing email argument not detected');
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Argument «email» not defined');
            }
        });
        it ('Check login with missing password argument', async () => {
            try {
                await api.auth.login('abc');
                expect.fail('Missing password argument not detected');
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Argument «password» not defined');
            }
        });
    });

    describe('Check login with invalid arguments', () => {

        it ('Check login with malformed email argument', async () => {
            try {
                await api.auth.login('abc', 'def');
                expect.fail('Invalid email argument not detected');
            }
            catch (error) {
                expect(error).to.be.an('error');
                expect(error).to.have.property('message', 'Property «email» is not a valid email');
                expect(error).to.have.property('errorId', 'InvalidRequestError');
            }
        });
        it ('Check login with bad email argument', async () => {
            try {
                await api.auth.login(userEmail, 'def');
                expect.fail('Invalid password argument not detected');
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Password is too small');
            }
        });
    });

    describe('Check login with valid arguments', () => {

        it ('Check login with invalid credentials', async () => {
            try {
                await api.auth.login(userEmail, `${PASSWORD}Z`);
                expect.fail('Invalid credentials not detected');
            }
            catch (error) {
                expect(error).to.be.an('error')
                    .with.property('message', 'Invalid EMail or password');
            }
        });

        it ('Check login with valid credentials', async () => {
            const result = await api.auth.login(userEmail, PASSWORD);
            expect(result).to.equal(undefined); // no result is returned
            const dbUser = await getDatabaseUserById(userId);
            expect(dbUser.state).to.equal(1); // ACTIVE
        });

    });

});
