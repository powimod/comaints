'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, jsonDelete, prepareRequestPath, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'

const ROUTE_UNIT_CREATE = '/api/v1/unit'
const ROUTE_UNIT_DELETE= '/api/v1/unit/{{unitId}}/delete'
const ROUTE_UNIT_GET = '/api/v1/unit/{{unitId}}'

describe('Test unit suppression', () => {

    const unit1Name = `Unit A`
    const unit2Name = `Unit B`
    const unit2Description = 'Unit B description'

    let user = null
    let unit1 = null
    let unit2 = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({withCompany:true})
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })


    describe('Check unit creation', () => {

        it(`Create first unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit1Name
                }
            })
            expect(json).to.have.keys('unit')
            unit1 = json.unit
        })

        it(`Create second unit`, async () => {
            const json = await jsonPost(ROUTE_UNIT_CREATE, {
                unit: {
                    name: unit2Name,
                    description: unit2Description
                }
            })
            expect(json).to.have.keys('unit')
            unit2 = json.unit
        })


        it(`Check first unit exists`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_GET, { unitId: unit1.id})
            const json = await jsonGet(route)
            expect(json).to.be.instanceOf(Object)
            expect(json.unit).to.have.property('id', unit1.id)
            expect(json.unit).to.have.property('name', unit1.name)
        })


        it(`Delete first unit`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit1.id})
            const json = await jsonDelete(route)
            expect(json).to.be.instanceOf(Object).and.to.have.keys('deleted')
            expect(json.deleted).to.be.a('boolean').and.to.equal(true)
        })


        it(`Check first unit is deleted`, async () => {
            const route = prepareRequestPath(ROUTE_UNIT_GET, { unitId: unit1.id})
            const json = await jsonGet(route)
            expect(json).to.be.instanceOf(Object).and.to.have.keys('unit')
            expect(json.unit).to.equal(null)
        })


        it(`Try to delete already deleted unit`, async () => {
            try {
                const route = prepareRequestPath(ROUTE_UNIT_DELETE, { unitId: unit1.id})
                const json = await jsonDelete(route)
                console.log(json)
                throw new Error('Non existent unit ID not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Ressource not found')
            }
        })

    })

})
