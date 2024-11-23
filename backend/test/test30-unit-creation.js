'use strict';
import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb } from './util.js';
import { createUserAccount, deleteUserAccount, changeUser } from './helpers.js';

const ROUTE_UNIT_LIST = '/api/v1/unit/list';
const ROUTE_UNIT_CREATE = '/api/v1/unit';

describe('Test units', () => {

    const unit1Name = `Unit A`;
    const unit2Name = `Unit B`;
    const unit3Name = `Unit C`;
    const unit2Description = 'Unit B description';

    let user1 = null;
    let user2 = null;
    let unit1 = null;
    let unit2 = null;
    let unit3 = null;

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


    describe('Check unit creation with invalid request', () => {

        it(`Try to create unit with no unit parameter`, async () => {
            try {
                await jsonPost(ROUTE_UNIT_CREATE, {});
                throw new Error('Missing unit parameter not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Parameter «unit» not found in request');
            }
        });

        it(`Try to create unit with invalid unit parameter`, async () => {
            try {
                await jsonPost(ROUTE_UNIT_CREATE, { unit: 'abc' });
                throw new Error('Invalid unit parameter not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid value for «unit» parameter in request');
            }
        });

        it(`Try to create unit with missing name property`, async () => {
            try {
                await jsonPost(ROUTE_UNIT_CREATE, { unit: {} });
                throw new Error('Missing name property not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Property «name» is not defined');
            }
        });

        it(`Try to create unit with empty name property`, async () => {
            try {
                await jsonPost(ROUTE_UNIT_CREATE, { unit: {
                    name: '' // empty name
                } });
                throw new Error('Empty name property not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Property «name» is too short');
            }
        });
    });

    describe('Check unit creation', () => {

        it(`Check unit list is empty`, async () => {
            let json = await jsonGet(ROUTE_UNIT_LIST);
            expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit');
            expect(json.count).to.be.a('number').and.to.equal(0);
            expect(json.page).to.be.a('number').and.to.equal(1);
            expect(json.limit).to.be.a('number').and.to.equal(10);
            const unitList = json.unitList;
            expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(0);
        });

        it(`Create first unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit1Name
                }
            });
            expect(json).to.have.keys('unit');
            const unit = json.unit;
            expect(unit).to.have.property('id');
            expect(unit.id).to.be.a('number');
            expect(unit).to.have.property('name');
            expect(unit.name).to.be.a('string').and.to.equal(unit1Name);
            expect(unit).to.have.property('companyId');
            expect(unit.companyId).to.be.a('number').and.to.equal(user1.companyId);
            unit1 = unit;
        });

        it(`Create second unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit2Name,
                    description: unit2Description
                }
            });
            expect(json).to.have.keys('unit');
            const unit = json.unit;
            expect(unit).to.be.instanceOf(Object);
            expect(unit).to.have.property('id');
            expect(unit.id).to.be.a('number');
            expect(unit).to.have.property('name');
            expect(unit.name).to.be.a('string').and.to.equal(unit2Name);
            expect(unit).to.have.property('companyId');
            expect(unit.companyId).to.be.a('number').and.to.equal(user1.companyId);
            unit2 = unit;
        });

        it(`Try to create a unit with an already used name`, async () => {
            try {
                await jsonPost(ROUTE_UNIT_CREATE, {
                    unit: {
                        name: unit2Name, // already created
                        description: unit2Description
                    }
                });
                throw new Error('Duplicated name not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «user»');
            }
        });


        it(`Create third unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit3Name
                }
            });
            expect(json).to.have.keys('unit');
            const unit = json.unit;
            expect(unit).to.be.instanceOf(Object);
            expect(unit).to.have.property('id');
            expect(unit.id).to.be.a('number');
            expect(unit).to.have.property('name');
            expect(unit.name).to.be.a('string').and.to.equal(unit3Name);
            expect(unit).to.have.property('companyId');
            expect(unit.companyId).to.be.a('number').and.to.equal(user1.companyId);
            unit3 = unit;
        });


        it(`Check unit list`, async () => {
            let json = await jsonGet(ROUTE_UNIT_LIST );
            expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit');
            expect(json.page).to.be.a('number').and.to.equal(1);
            expect(json.limit).to.be.a('number').and.to.equal(10);
            const unitList = json.unitList;
            expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(3);

            let unit = unitList[0];
            expect(unit).to.be.instanceOf(Object).and.to.have.keys('id', 'name');
            expect(unit.id).to.be.a('number').and.to.equal(unit1.id);
            expect(unit.name).to.be.a('string').and.to.equal(unit1.name);

            unit = unitList[1];
            expect(unit).to.be.instanceOf(Object).and.to.have.keys('id', 'name');
            expect(unit.id).to.be.a('number').and.to.equal(unit2.id);
            expect(unit.name).to.be.a('string').and.to.equal(unit2.name);

            unit = unitList[2];
            expect(unit).to.be.instanceOf(Object).and.to.have.keys('id', 'name');
            expect(unit.id).to.be.a('number').and.to.equal(unit3.id);
            expect(unit.name).to.be.a('string').and.to.equal(unit3.name);
        });

    });

    describe('Check unit creation with two companies', () => {
        const unitName = 'New unit';

        it(`Check owner can access its unit`, async () => {
            // get unit count of first user 
            await changeUser(user1);
            let json = await jsonGet(ROUTE_UNIT_LIST);
            const unitCountUser1 = json.count;

            // check second user has no unit
            await changeUser(user2);
            json = await jsonGet(ROUTE_UNIT_LIST);
            expect(json.count).and.to.equal(0);

            // create a unit with second user
            json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unitName
                }
            });
            expect(json).to.have.keys('unit');
            let unit = json.unit;
            expect(unit.name).to.equal(unitName);

            // check unit count
            json = await jsonGet(ROUTE_UNIT_LIST);
            expect(json).to.be.instanceOf(Object);
            expect(json.count).and.to.equal(1);

            // check unit count of first user has not changed
            await changeUser(user1);
            json = await jsonGet(ROUTE_UNIT_LIST);
            expect(json.count).and.to.equal(unitCountUser1);
        });
    });
 
});
