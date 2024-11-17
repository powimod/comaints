'use strict'
import { expect } from 'chai'

import { loadConfig, jsonGet, jsonPost, prepareRequestPath, connectDb, disconnectDb } from './util.js'
import { createUserAccount, deleteUserAccount } from './helpers.js'

const ROUTE_UNIT_CREATE = '/api/v1/unit'
const ROUTE_UNIT_DETAILS = '/api/v1/unit/{{unitId}}'
const ROUTE_UNIT_EDIT = '/api/v1/unit/{{unitId}}'

describe('Test unit edition', () => {

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

    // TODO tentative d'édition avec propriétés manquantes ou invalides

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

        it(`Edit first unit`, async () => {
            const refUnit = unit1
            const editedUnit = {... refUnit}
            const newName = editedUnit.name + '_edited'
            editedUnit.name = newName
            const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id})
            const json = await jsonPost(route, { unit: editedUnit })
            expect(json).to.have.keys('unit')
            const unit = json.unit
            expect(unit).to.have.property('id', refUnit.id)
            expect(unit).to.have.property('name', newName)
            expect(unit).to.have.property('companyId', refUnit.companyId)
            unit1 = editedUnit
        })

        it(`Edit first unit with already used name`, async () => {
            const refUnit = unit1
            const editedUnit = {... refUnit}
            editedUnit.name = unit2.name
            try {
                const route = prepareRequestPath(ROUTE_UNIT_EDIT, { unitId: refUnit.id})
                await jsonPost(route, { unit: editedUnit })
                throw new Error('Duplicated name not detected')
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal('Duplicated «idx_company_name» field for object «user»')
            }
        })

    })

})
