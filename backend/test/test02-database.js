'use strict'

import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost } from './util.js'

describe('Check database', () => {

	before( () =>  {
		loadConfig()
	}),

	describe('Test company list API', () => {

        const COMPANY_LIST_ROUTE = '/api/v1/company/list'
		it(`Control route ${COMPANY_LIST_ROUTE }`, async () => {
			let json = await jsonGet(COMPANY_LIST_ROUTE)
			expect(json).to.have.property('companyList')
            const companyList = json.companyList
            expect(companyList).to.be.instanceOf(Array)
            if (companyList.length > 0) {
                const company = companyList[0]
                expect(company).to.be.instanceOf(Object)
                expect(company).to.have.property('id')
                expect(company.id).to.be.a('number')
                expect(company).to.have.property('name')
                expect(company.name).to.be.a('string')
            }
		})
    })

	describe('Test company list API', () => {

        const COMPANY_CREATE = '/api/v1/company'
		it(`Control route ${COMPANY_CREATE} without argument`, async () => {
            let success = false
            try {
                const json = await jsonPost(COMPANY_CREATE)
                success = true
            }
            catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect(error.message).to.equal(`Server status 400 (Can't find «company» in request body)`)
            }
            expect(success, 'Should generate an error').to.equal(false)
		})

        const dte = new Date()
        const newCompanyName = `company ${dte.getTime()}`

		it(`Control route ${COMPANY_CREATE}`, async () => {
            const json = await jsonPost(COMPANY_CREATE, {
                company: {
                    name: newCompanyName
                }
            })
            expect(json).to.have.property('id')
            expect(json.id).to.be.a('number')
            expect(json).to.have.property('name')
            expect(json.name).to.be.a('string').and.to.equal(newCompanyName)
		})



	})
})

