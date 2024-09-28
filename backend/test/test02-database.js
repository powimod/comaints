'use strict'

import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost } from './util.js'

describe('Check database', () => {

	before( () =>  {
		loadConfig()
	}),

	describe('Test API', () => {

        const COMPANY_LIST_ROUTE = '/api/v1/company/list'
		it(`Control route ${COMPANY_LIST_ROUTE }`, async () => {
			let json = await jsonGet(COMPANY_LIST_ROUTE)
			expect(json).to.have.property('companyList')
		})

	})
})

