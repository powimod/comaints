'use strict'
import { expect } from 'chai'
import assert from 'assert'

import { loadConfig, jsonGet, jsonPost, connectDb, disconnectDb, requestDb, refreshToken, accessToken } from './util.js'
import { createUserAccount, deleteUserAccount, userPublicProperties, getDatabaseUserByEmail } from './helpers.js'

const ROUTE_UNIT_LIST = '/api/v1/unit/list'
const ROUTE_UNIT_CREATE = '/api/v1/unit'

describe('Test units', () => {

    const unit1Name = `Unit A`
    const unit2Name = `Unit B`
    const unit3Name = `Unit C`

    let user = null
    let company = null

    before( async () =>  {
        loadConfig()
        await connectDb()
        user = await createUserAccount({withCompany:true})
    })

    after( async () =>  {
        await deleteUserAccount(user)
        await disconnectDb()
    })


    it(`Check unit list is empty`, async () => {
        let json = await jsonGet(ROUTE_UNIT_LIST )
        expect(json).to.be.instanceOf(Object).and.to.have.keys('unitList')
        const unitList = json.unitList
        expect(unitList).to.be.instanceOf(Array).and.to.have.lengthOf(0)
    })

    it(`Create first unit`, async () => {
        const json = await jsonPost(ROUTE_UNIT_CREATE, {
            unit: {
                name: unit1Name
            }
        })
        expect(json).to.have.property('id')
        expect(json.id).to.be.a('number')
        expect(json).to.have.property('name')
        expect(json.name).to.be.a('string').and.to.equal(unit1Name)
    })

})
