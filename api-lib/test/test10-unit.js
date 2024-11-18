'use strict'
import { expect } from 'chai'

import { api, initializeApi, terminateApi, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccountById } from './helpers.js'

describe('Check login', () => {
    const unitPool = []
    let user = null

	before( async () =>  {
        await connectDb()
		initializeApi()
        user = await createUserAccount({withCompany: true})
	}),

    after( async () =>  {
        await deleteUserAccountById(user.id)
        await disconnectDb()
        await terminateApi()
    })


    describe('Check unit creation', () => {
        const UNIT_NAME_1 = 'First Unit'
        const UNIT_NAME_2 = 'Second Unit'

        it ('Create unit', async () => {
            const unit = await api.unit.createUnit({
                name: UNIT_NAME_1
            })
            expect(unit).to.be.instanceOf(Object)
            expect(unit).to.have.property('id')
            expect(unit).to.have.property('name', UNIT_NAME_1)
            expect(unit).to.have.property('companyId')
            unitPool.push(unit)
        })

        it ('Try do create a second unit with the same name', async () => {
            try {
                await api.unit.createUnit({
                    name: UNIT_NAME_1
                })
                throw new Error('Duplicated unit not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Object)
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «user»')
            }
        })

        it ('Create a second unit', async () => {
            const unit = await api.unit.createUnit({
                name: UNIT_NAME_2
            })
            expect(unit).to.be.instanceOf(Object)
            expect(unit).to.have.property('id')
            expect(unit).to.have.property('name', UNIT_NAME_2)
            expect(unit).to.have.property('companyId')
            unitPool.push(unit)
        })


    })

    describe('Check unit list', () => {
        it ('List unit', async () => {
            let unit, unitRef
            const unitList = await api.unit.listUnit()
            expect(unitList).to.be.instanceOf(Array)
            unit = unitList[0]
            unitRef = unitPool[0]
            expect(unit).to.be.instanceOf(Object).to.have.keys(['id', 'name'])
            expect(unit.name).to.equal(unitRef.name)
            expect(unit.id).to.equal(unitRef.id)
            unit = unitList[1]
            unitRef = unitPool[1]
            expect(unit).to.be.instanceOf(Object).to.have.keys(['id', 'name'])
            expect(unit.name).to.equal(unitRef.name)
            expect(unit.id).to.equal(unitRef.id)
        })
    })

    describe('Check unit details', () => {

        it ('Try to get unit without ID', async () => {
            try {
                await api.unit.getUnitById()
                throw new Error('Missing ID not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Argument «unit» required')
            }
        })

        it ('Try to get unit with invalid ID', async () => {
            try {
                await api.unit.getUnitById('abc')
                throw new Error('Invalid ID not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Argument «unit» is not valid')
            }
        })


        it ('Try to get unit by non existent ID', async () => {
            const unitRef = unitPool[0]
            const unit = await api.unit.getUnitById(unitRef.id + 9999)
            expect(unit).to.equal(null)
        })

        it ('Get unit by ID', async () => {
            const unitRef = unitPool[0]
            const unit = await api.unit.getUnitById(unitRef.id)
            expect(unit).to.be.instanceOf(Object)
                .to.have.keys(['id', 'name', 'description', 'address', 'city', 'zipCode', 'country', 'companyId'])
            expect(unit.name).to.equal(unitRef.name)
            expect(unit.id).to.equal(unitRef.id)
            expect(unit.companyId).to.equal(unitRef.companyId)
        })
    })

    describe('Edit unit', () => {

        it ('Get unit by ID', async () => {
            const unitRef = unitPool[0]
            let unit = {... unitRef}
            const newName = unit.name + '_edited'
            unit.name = newName
            unit = await api.unit.editUnit(unit)
            expect(unit).to.be.instanceOf(Object)
                .to.have.keys(['id', 'name', 'description', 'address', 'city', 'zipCode', 'country', 'companyId'])
            expect(unit.name).to.equal(newName)
            expect(unit.id).to.equal(unitRef.id)
            expect(unit.companyId).to.equal(unitRef.companyId)
        })


        it ('Try to edit unit with invalid company ID', async () => {
            const unitRef = unitPool[0]
            let unit = {... unitRef}
            const newName = unit.name + '_edited'
            unit.companyId = unit.id + 999
            unit.name = newName
            try {
                unit = await api.unit.editUnit(unit)
                throw new Error('Invalid ID not detected')
            }
            catch(error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Invalid ID «companyid» in object «unit»')
            }
        })

        it ('Try to edit unit with already used name', async () => {
            const unitRef = unitPool[0]
            let unit = {... unitRef}
            unit.name = unitPool[1].name
            try {
                unit = await api.unit.editUnit(unit)
                throw new Error('Invalid ID not detected')
            }
            catch(error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «user»')
            }
        })
    })

    describe('Delete unit', () => {

        it ('Check unit access', async () => {
            const refUnit = unitPool[1]
            const unit = await api.unit.getUnitById(refUnit.id)
            expect(unit).to.be.instanceOf(Object)
                .to.have.keys(['id', 'name', 'description', 'address', 'city', 'zipCode', 'country', 'companyId'])
            expect(unit.name).to.equal(refUnit.name)
            expect(unit.id).to.equal(refUnit.id)
        })


        it ('Delete unit by ID', async () => {
            const unit = unitPool[1]
            const res = await api.unit.deleteUnitById(unit.id)
            expect(res).to.be.a('boolean').and.to.equal(true)
        })

        it ('Check unit was deleted', async () => {
            const refUnit = unitPool[1]
            const unit = await api.unit.getUnitById(refUnit.id)
            expect(unit).to.equal(null)
        })

    })

})
