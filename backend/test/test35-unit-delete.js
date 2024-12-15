
import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost, jsonDelete, prepareRequestPath, connectDb, disconnectDb } from './util.js';
import { createUserAccount, deleteUserAccount, changeUser } from './helpers.js';

const ROUTE_UNIT_CREATE = '/api/v1/unit';
const ROUTE_UNIT_DELETE= '/api/v1/unit/{{unitId}}/delete';
const ROUTE_UNIT_GET = '/api/v1/unit/{{unitId}}';

describe('Test unit suppression', () => {

    const unit1Name = `Unit A`;
    const unit2Name = `Unit B`;
    const unit2Description = 'Unit B description';

    let user1 = null;
    let user2 = null;
    let unit1 = null;

    before( async () =>  {
        loadConfig();
        await connectDb();
        user2 = await createUserAccount({withCompany:true});
        user1 = await createUserAccount({withCompany:true});
    });

    after( async () =>  {
        await deleteUserAccount(user1);
        await deleteUserAccount(user2);
        await disconnectDb();
    });


    describe('Check unit creation', () => {

        it(`Create first unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit1Name
                }
            });
            expect(json).to.have.keys('unit');
            unit1 = json.unit;
        });

        it(`Create second unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit2Name,
                    description: unit2Description
                }
            });
            expect(json).to.have.keys('unit');
        });


        it(`Check first unit exists`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_GET, { unitId: unit1.id});
            const json = await jsonGet(route);
            expect(json).to.be.instanceOf(Object);
            expect(json.unit).to.have.property('id', unit1.id);
            expect(json.unit).to.have.property('name', unit1.name);
        });


        it(`Delete first unit`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit1.id});
            const json = await jsonDelete(route);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('deleted');
            expect(json.deleted).to.be.a('boolean').and.to.equal(true);
        });


        it(`Check first unit is deleted`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_GET, { unitId: unit1.id});
            const json = await jsonGet(route);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('unit');
            expect(json.unit).to.equal(null);
        });


        it(`Try to delete already deleted unit`, async () => {
            try {
                const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit1.id});
                const json = await jsonDelete(route);
                throw new Error('Non existent unit ID not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Ressource not found');
            }
        });
    });


    describe('Check unit suppression with two companies', () => {

        const unitName = 'Unit to delete';
        let unit = null;

        it(`Check owner can delete its units`, async () => {
            await changeUser(user1);
            // create a unit
            let json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unitName
                }
            });
            expect(json).to.have.keys('unit');
            unit = json.unit;
            // delete this unit with same user with same user
            const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit.id});
            json = await jsonDelete(route);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('deleted');
            expect(json.deleted).to.be.a('boolean').and.to.equal(true);
        });
        it(`Check other user can not delete this units`, async () => {
            // create a unit with first user
            await changeUser(user1);
            let json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unitName
                }
            });
            expect(json).to.have.keys('unit');
            unit = json.unit;
            // delete this unit with same user with other user
            await changeUser(user2);
            try {
                const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit.id});
                json = await jsonDelete(route);
                throw new Error('Unauthorized access not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Object);
                expect(error.message).to.equal('Your company is not owner of this ressource');
            }
        });
    });


});
