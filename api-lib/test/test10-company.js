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
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «unit»')
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
 
})
