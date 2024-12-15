
import {expect} from 'chai';

import {loadConfig, jsonPost, connectDb, disconnectDb} from './util.js';
import {createUserAccount, deleteUserAccount, getDatabaseUserById} from './helpers.js';

const ROUTE_DELETE_ACCOUNT = 'api/v1/account/delete';
const ROUTE_VALIDATE = 'api/v1/auth/validate';
const ROUTE_INITIALIZE_COMPANY = 'api/v1/company/initialize';

describe('Test delete account route', () => {

    const companyName = 'My company';

    let user = null;
    let userId = null;
    let authCode = null;
    let company = null;

    before(async () => {
        loadConfig();
        await connectDb();
        user = await createUserAccount();
        userId = user.id;
    });

    after(async () => {
        await deleteUserAccount(user);
        await disconnectDb();
    });


    describe('Call account delete route with company initialized', () => {

        it(`Initialize company`, async () => {
            let json = await jsonPost(ROUTE_INITIALIZE_COMPANY, {companyName});
            expect(json).to.be.instanceOf(Object).and.to.have.keys('company', 'access-token', 'refresh-token', 'context');
            company = json.company;
            expect(company).to.be.instanceOf(Object).and.to.have.keys('id', 'name');
            expect(company.id).to.be.a('number');
            expect(company.name).to.be.a('string').and.to.equal(companyName);
        });

        it('Call route to delete account', async () => {
            const json = await jsonPost(ROUTE_DELETE_ACCOUNT, {confirmation: true, sendCodeByEmail: false});
            expect(json).to.be.instanceOf(Object);
            expect(json).to.have.property('message');
            expect(json.message).to.be.a('string').and.to.equal('Done, waiting for validation code');
        });

        it('Check user in database before code validation', async () => {
            const dbUser = await getDatabaseUserById(user.id);
            expect(dbUser).to.be.instanceOf(Object);
            expect(dbUser.auth_code).to.be.above(0);
            authCode = dbUser.auth_code;
        });

        it('Send validation code', async () => {
            const json = await jsonPost(ROUTE_VALIDATE, {code: authCode});
            expect(json).to.be.instanceOf(Object);
            expect(json).to.have.property('validated', true);
        });

        it('Check user was deleted in database after code validation', async () => {
            const dbUser = await getDatabaseUserById(userId);
            expect(dbUser).to.equal(null);
        });

    });
});


