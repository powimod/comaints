'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, prepareRequestPath, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'

const ROUTE_UNIT_DETAILS = '/api/v1/unit/{{unitId}}'
const ROUTE_UNIT_CREATE = '/api/v1/unit'

describe('Test units', () => {


    let user = null
    const unitCount = 3
    let unitPool = []

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({withCompany:true})
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })


    describe('Create unit pool', () => {
        it(`Create unit`, async () => {
            for (let iUnit = 1; iUnit <= unitCount; iUnit++) {
                const unitIndex = iUnit.toString().padStart(2, '0')
                const json = await jsonPost(ROUTE_UNIT_CREATE, {
                    unit: {
                        name: `Unit n°${unitIndex}`,
                        description: `Unit description n°${iUnit}`
                    }
                })
                expect(json).to.have.keys('unit')
                unitPool.push(json.unit)
            }
        })
    })


    describe('Get unit details', () => {

        it(`Check unit details fetch`, async () => {
            const refUnit = unitPool[0]
            const route = prepareRequestPath(ROUTE_UNIT_DETAILS, { unitId: refUnit.id})
            const json = await jsonGet(route)
            expect(json).to.be.instanceOf(Object).and.to.have.keys([ 'unit' ])
            const unit = json.unit
            expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name', 'description', 'address', 'city', 'zipCode', 'country', 'companyId' ])
            expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
            expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
            expect(unit.description).to.be.a('string').and.to.equal(refUnit.description)
            expect(unit.companyId).to.be.a('number').and.to.equal(refUnit.companyId)
        })

        it(`Try to fetch unit details with non existent ID`, async () => {
            const refUnit = unitPool[0]
            const invalidId = refUnit.id  + 999
            const route = prepareRequestPath(ROUTE_UNIT_DETAILS, { unitId: invalidId})
            const json = await jsonGet(route)
            expect(json).to.be.instanceOf(Object).and.to.have.keys([ 'unit' ])
            const unit = json.unit
            expect(unit).to.equal(null)
        })
    })

})
