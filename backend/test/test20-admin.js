
import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb } from './util.js';
import { createUserAccount, deleteUserAccount, connectWithAdminAccount } from './helpers.js';

const ROUTE_CHECK_ADMIN = '/api/v1/admin/check-access';
const ROUTE_LOGOUT   = 'api/v1/auth/logout';

describe('Test admin', () => {

    let normalUser = null;

    before( async () =>  {
        loadConfig();
        await connectDb();
        normalUser = await createUserAccount();
    }),

    after( async () =>  {
        await deleteUserAccount(normalUser);
        await disconnectDb();
    }),

    it(`Try to access admin route with normal user`, async () => {
        try {
            await jsonGet(ROUTE_CHECK_ADMIN);
            throw new Error('Non admin account not detected');
        }
        catch (error) {
            expect(error).to.be.instanceOf(Error);
            expect(error.message).to.be.a('string').and.to.equal('Unauthorized access');
        }
    });

    it('Call logout route', async () => {
        const json = await jsonPost(ROUTE_LOGOUT, {});
        expect(json).to.be.instanceOf(Object).to.have.keys('access-token', 'refresh-token', 'context', 'message');
        expect(json.message).to.be.a('string').and.to.equal('logout success');
    });
 
    it(`Check login with admin account`, async () => {
        const json= await connectWithAdminAccount();
        expect(json).to.be.instanceOf(Object).and.to.have.keys('message', 'context', 'access-token', 'refresh-token');
        expect(json.context).to.be.instanceOf(Object).and.to.have.keys('email', 'connected', 'administrator', 'company');
        expect(json.context.administrator).to.be.a('boolean').and.to.equal(true);
        expect(json.context.company).to.be.a('boolean').and.to.equal(false);
    });

    it(`Check admin access is authorized`, async () => {
        const json = await jsonGet(ROUTE_CHECK_ADMIN);
        expect(json).to.be.instanceOf(Object).and.to.have.keys('message');
        expect(json.message).to.be.a('string').and.to.equal('This is an administrator account');
    });
});


