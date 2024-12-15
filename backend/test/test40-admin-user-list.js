
import {expect} from 'chai';

import {loadConfig, jsonGet, connectDb, disconnectDb} from './util.js';
import {createUserAccount, deleteUserAccount, connectWithAdminAccount} from './helpers.js';

const ROUTE_USER_LIST = '/api/v1/user/list';

describe('Test users list with admin account', () => {

    const userCount = 15;
    let userPool = [];

    before(async () => {
        loadConfig();
        await connectDb();
        for (let iUser = 1; iUser <= userCount; iUser++)
            userPool.push(await createUserAccount({withCompany: true, logout: true}));
    });

    after(async () => {
        for (const user of userPool)
            await deleteUserAccount(user);
        await disconnectDb();
    });



    describe('Check user list with admin account', () => {

        it(`Log with admin account`, async () => {
            const json = await connectWithAdminAccount();
            expect(json.context).to.be.instanceOf(Object);
            expect(json.context).to.have.property('administrator', true);
            expect(json.context).to.have.property('company', false);
        });

        it(`Check user list without filtering`, async () => {
            let json = await jsonGet(ROUTE_USER_LIST);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('userList', 'count', 'page', 'limit');
            expect(json.count).to.be.a('number').and.to.be.above(userCount);
            expect(json.limit).to.be.a('number').and.to.equal(10);
            expect(json.page).to.be.a('number').and.to.equal(1);
            const userList = json.userList;
            expect(userList).to.be.instanceOf(Array).and.to.have.lengthOf(10);
            //console.log("users", userList.map( u => u.name).join(', '))
            let user = userList[0];
            expect(user).to.be.instanceOf(Object).and.to.have.keys(['id', 'email', 'firstname', 'lastname']);
            expect(user.id).to.be.a('number');
        });


        describe('Check user list with pagination', () => {

            it(`Try user list with invalid page`, async () => {
                try {
                    await jsonGet(ROUTE_USER_LIST, {
                        page: 'abc',
                    });
                    throw new Error('Invalid page not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Invalid value for «page» parameter in request');
                }
            });

            it(`Try user list with invalid limit`, async () => {
                try {
                    await jsonGet(ROUTE_USER_LIST, {
                        limit: 'abc',
                    });
                    throw new Error('Invalid page not detected');
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error);
                    expect(error.message).to.equal('Invalid value for «limit» parameter in request');
                }
            });

            it(`Check user list page n°1`, async () => {
                let user;
                let json = await jsonGet(ROUTE_USER_LIST, {
                    page: 1,
                    limit: 6
                });
                expect(json).to.be.instanceOf(Object).and.to.have.keys('userList', 'count', 'page', 'limit');
                expect(json.count).to.be.a('number').and.to.be.above(15);
                expect(json.limit).to.be.a('number').and.to.equal(6);
                expect(json.page).to.be.a('number').and.to.equal(1);
                const userList = json.userList;
                expect(userList).to.be.instanceOf(Array).and.to.have.lengthOf(6);
                //console.log("users", userList.map( u => u.name).join(', '))
                user = userList[0];
                expect(user).to.be.instanceOf(Object).and.to.have.keys(['id', 'email', 'firstname', 'lastname']);
            });

        });

        describe('Check user list with properties', () => {
            it(`Check user list without properties`, async () => {
                let user;
                let json = await jsonGet(ROUTE_USER_LIST, {
                    properties: ['id', 'email', 'administrator', 'manager']
                });
                expect(json).to.be.instanceOf(Object).and.to.have.keys('userList', 'count', 'page', 'limit');
                const userList = json.userList;
                expect(userList).to.be.instanceOf(Array).and.to.have.lengthOf(10);
                user = userList[0];
                expect(user).to.be.instanceOf(Object).and.to.have.keys(['id', 'email', 'administrator', 'manager']);
            });

            it(`Check password filtering`, async () => {
                let user;
                let json = await jsonGet(ROUTE_USER_LIST, {
                    properties: ['id', 'email', 'password']
                });
                expect(json).to.be.instanceOf(Object).and.to.have.keys('userList', 'count', 'page', 'limit');
                const userList = json.userList;
                expect(userList).to.be.instanceOf(Array).and.to.have.lengthOf(10);
                user = userList[0];
                expect(user).to.be.instanceOf(Object).and.to.have.keys(['id', 'email']); // password must not be present
            });
        });

    });

    /* TODO
    describe('Check user list with user account', () => {
        it(`Check owner can access its users`, async () => {
            const refUser = userPool[0]
            // get unit count of first user 
            await changeUser(refUser);
            let json = await jsonGet(ROUTE_USER_LIST);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('userList', 'count', 'page', 'limit');
            expect(json.count).to.be.a('number').and.to.be.equal(1);
            expect(json.limit).to.be.a('number').and.to.equal(10);
            expect(json.page).to.be.a('number').and.to.equal(1);
            const userList = json.userList;
            expect(userList).to.be.instanceOf(Array).and.to.have.lengthOf(1);
            let user = userList[0];
            expect(user).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'email', 'firstname', 'lastname' ]);
            expect(user.id).to.equal(refUser.id)
            expect(user.email).equal(refUser.email)
        })
    })
    */

});
