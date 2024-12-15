
import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost, prepareRequestPath, connectDb, disconnectDb } from './util.js';
import { createUserAccount, deleteUserAccount, changeUser } from './helpers.js';

const ROUTE_UNIT_CREATE = '/api/v1/unit';
const ROUTE_UNIT_EDIT = '/api/v1/unit/{{unitId}}';

describe('Test unit edition', () => {

    const unit1Name = `Unit A`;
    const unit2Name = `Unit B`;
    const unit2Description = 'Unit B description';

    let user1 = null;
    let user2 = null;
    let unit1 = null;
    let unit2 = null;

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


    describe('Create two units to work with', () => {
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
            unit2 = json.unit;
        });
    });

    describe('Check unit edition with invalid request', () => {

        it(`Try to edit unit with no unit parameter`, async () => {
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: unit1.id});
                const json = await jsonPost(route, { });
                console.log(json);
                throw new Error('Missing unit parameter not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Parameter «unit» not found in request');
            }
        });

        it(`Try to edit unit with invalid unit parameter`, async () => {
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: unit1.id});
                const json = await jsonPost(route, { unit: 'abc' });
                console.log(json);
                throw new Error('Invalid unit parameter not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid value for «unit» parameter in request');
            }
        });

        it(`Try to edit unit with missing ID`, async () => {
            const unit = {... unit1};
            delete unit.id;
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: unit1.id});
                const json = await jsonPost(route, { unit });
                console.log(json);
                throw new Error('Missing ID not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Invalid ID «id» in object «unit»');
            }
        });

        it(`Try to edit unit with empty name property`, async () => {
            const unit = {... unit1};
            unit.name = '';
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: unit1.id});
                const json = await jsonPost(route, { unit });
                console.log(json);
                throw new Error('Empty name property not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Property «name» is too short');
            }
        });
    });

    describe('Check unit creation', () => {


        it(`Edit first unit`, async () => {
            const refUnit = unit1;
            const editedUnit = {... refUnit};
            const newName = editedUnit.name + '_edited';
            editedUnit.name = newName;
            const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id});
            const json = await jsonPost(route, { unit: editedUnit });
            expect(json).to.have.keys('unit');
            const unit = json.unit;
            expect(unit).to.have.property('id', refUnit.id);
            expect(unit).to.have.property('name', newName);
            expect(unit).to.have.property('companyId', refUnit.companyId);
            unit1 = editedUnit;
        });

        it(`Edit first unit with already used name`, async () => {
            const refUnit = unit1;
            const editedUnit = {... refUnit};
            editedUnit.name = unit2.name;
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id});
                await jsonPost(route, { unit: editedUnit });
                throw new Error('Duplicated name not detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error);
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «user»');
            }
        });

    });

    describe('Check unit with two companies', () => {
        it(`Check owner can edit its units`, async () => {
            await changeUser(user1);
            const refUnit = unit2;
            const editedUnit = {... refUnit};
            const newName = editedUnit.name + '_edited';
            editedUnit.name = newName;
            const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id});
            const json = await jsonPost(route, { unit: editedUnit });
            expect(json).to.have.keys('unit');
            const unit = json.unit;
            expect(unit).to.have.property('id', refUnit.id);
            expect(unit).to.have.property('name', newName);
            expect(unit).to.have.property('companyId', refUnit.companyId);
            unit2 = editedUnit;
        });
        it(`Check other user can not edit this units`, async () => {
            await changeUser(user2);
            const refUnit = unit2;
            const editedUnit = {... refUnit};
            const newName = editedUnit.name + '_edited';
            editedUnit.name = newName;
            const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id});
            try {
                const json = await jsonPost(route, { unit: editedUnit });
                console.log(json);
                throw new Error('Unauthorized acces non detected');
            }
            catch (error) {
                expect(error).to.be.instanceOf(Object);
                expect(error.message).to.equal('Your company is not owner of this ressource');
            }
        });
    });
});
