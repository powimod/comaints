'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccount, changeUser } from './helpers.js'

const ROUTE_UNIT_LIST = '/api/v1/unit/list'
const ROUTE_UNIT_CREATE = '/api/v1/unit'

describe('Test units', () => {


    let user1 = null
    let user2 = null
    const unitCount = 15
    let unitPool = []

    before( async () =>  {
        loadConfig()
        await connectDb()
        user2 = await createUserAccount({withCompany:true})
        user1 = await createUserAccount({withCompany:true})
    })

    after( async () =>  {
        await deleteUserAccount(user1)
        await deleteUserAccount(user2)
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


    describe('Check unit list', () => {

        it(`Check unit list without filtering`, async () => {
            let json = await jsonGet(ROUTE_UNIT_LIST)
            expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit')
            expect(json.count).to.be.a('number').and.to.equal(15)
            expect(json.limit).to.be.a('number').and.to.equal(10)
            expect(json.page).to.be.a('number').and.to.equal(1)
            const unitList = json.unitList
            expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(10)
            //console.log("units", unitList.map( u => u.name).join(', '))
            let unit = unitList[0]
            let refUnit = unitPool[0]
            expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
            expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
            expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
        })


        describe('Check unit list with pagination', () => {

            it(`Try unit list with invalid page`, async () => {
                try {
                    await jsonGet(ROUTE_UNIT_LIST, {
                        page: 'abc',
                    })
                    throw new Error('Invalid page not detected')
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.equal('Invalid value for «page» parameter in request')
                }
            })

            it(`Try unit list with invalid limit`, async () => {
                try {
                    await jsonGet(ROUTE_UNIT_LIST, {
                        limit: 'abc',
                    })
                    throw new Error('Invalid page not detected')
                }
                catch (error) {
                    expect(error).to.be.instanceOf(Error)
                    expect(error.message).to.equal('Invalid value for «limit» parameter in request')
                }
            })


            it(`Check unit list page n°1`, async () => {
                let unit, refUnit
                let json = await jsonGet(ROUTE_UNIT_LIST, {
                    page: 1,
                    limit: 6
                })
                expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit')
                expect(json.count).to.be.a('number').and.to.equal(15)
                expect(json.limit).to.be.a('number').and.to.equal(6)
                expect(json.page).to.be.a('number').and.to.equal(1)
                const unitList = json.unitList
                expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(6)
                //console.log("units", unitList.map( u => u.name).join(', '))
                unit = unitList[0]
                refUnit = unitPool[0]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
                unit = unitList[5]
                refUnit = unitPool[5]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)

            })

            it(`Check unit list page n°2`, async () => {
                let unit, refUnit
                let json = await jsonGet(ROUTE_UNIT_LIST, {
                    page: 2,
                    limit: 6
                })
                expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit')
                expect(json.count).to.be.a('number').and.to.equal(15)
                expect(json.limit).to.be.a('number').and.to.equal(6)
                expect(json.page).to.be.a('number').and.to.equal(2)
                const unitList = json.unitList
                //console.log("units", unitList.map( u => u.name).join(', '))
                expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(6)
                unit = unitList[0]
                refUnit = unitPool[6]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
                unit = unitList[5]
                refUnit = unitPool[11]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
            })

            it(`Check unit list page n°3`, async () => {
                let unit, refUnit
                let json = await jsonGet(ROUTE_UNIT_LIST, {
                    page: 3,
                    limit: 6
                })
                expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit')
                expect(json.count).to.be.a('number').and.to.equal(15)
                expect(json.limit).to.be.a('number').and.to.equal(6)
                expect(json.page).to.be.a('number').and.to.equal(3)
                const unitList = json.unitList
                expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(3)
                //console.log("units", unitList.map( u => u.name).join(', '))
                unit = unitList[0]
                refUnit = unitPool[12]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
                unit = unitList[2]
                refUnit = unitPool[14]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name' ])
                expect(unit.name).to.be.a('string').and.to.equal(refUnit.name)
                expect(unit.id).to.be.a('number').and.to.equal(refUnit.id)
            })
        })


        describe('Check unit list with properties', () => {
            it(`Check unit list without properties`, async () => {
                let unit, unitRef
                let json = await jsonGet(ROUTE_UNIT_LIST, {
                    properties: [ 'id', 'name', 'description', 'companyId' ]
                })
                expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList', 'count', 'page', 'limit')
                const unitList = json.unitList
                expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(10)
                unit = unitList[0]
                unitRef = unitPool[0]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name', 'description', 'companyId' ])
                expect(unit.id).to.be.a('number').and.to.equal(unitRef.id)
                expect(unit.name).to.be.a('string').and.to.equal(unitRef.name)
                expect(unit.companyId).to.be.a('number').and.to.equal(user1.companyId)
                expect(unit.description).to.be.equal(unitRef.description)

                unit = unitList[1]
                unitRef = unitPool[1]
                expect(unit).to.be.instanceOf(Object).and.to.have.keys([ 'id', 'name', 'description', 'companyId' ])
                expect(unit.id).to.be.a('number').and.to.equal(unitRef.id)
                expect(unit.name).to.be.a('string').and.to.equal(unitRef.name)
                expect(unit.companyId).to.be.a('number').and.to.equal(user1.companyId)
                expect(unit.description).to.be.equal(unitRef.description)
            })
        })

    })

    describe('Check unit with two companies', () => {
        it(`Check owner can access its unit`, async () => {
            await changeUser(user1)
            let json = await jsonGet(ROUTE_UNIT_LIST)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('count', 15)
        })
        it(`Check other user does not access this units`, async () => {
            await changeUser(user2)
            let json = await jsonGet(ROUTE_UNIT_LIST)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('count', 0)
        })
        it(`Create a unit for second user`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: `Other unit`
                }
            })
            expect(json).to.have.keys('unit')
            unitPool.push(json.unit)
        })
        it(`Check owner can access this unit`, async () => {
            let json = await jsonGet(ROUTE_UNIT_LIST)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('count', 1)
            expect(json).to.have.property('unitList')
            const unit = json.unitList[0]
            expect(unit).to.have.property('name', 'Other unit')
            // FIXME companyId it not present
        })
         it(`Check other user does not access this unit`, async () => {
            await changeUser(user1)
            let json = await jsonGet(ROUTE_UNIT_LIST)
            expect(json).to.be.instanceOf(Object)
            expect(json).to.have.property('count', 15)
        })
 
    })


})
