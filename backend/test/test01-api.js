'use strict'

import { expect } from 'chai';

import { loadConfig, jsonGet, jsonPost } from './util.js'

describe('Check API version', () => {

	before( () =>  {
		loadConfig()
	}),

	describe('Test API', () => {

        const API_VERSION_ROUTE = '/api/version'
		it(`Control route ${API_VERSION_ROUTE}`, async () => {
			let json = await jsonGet(API_VERSION_ROUTE)
			expect(json).to.have.property('version')
			expect(json.version).to.be.a('string')
				.and.match(/^v\d+$/)
		})

        const BACKEND_VERSION_ROUTE = '/api/v1/backend-version'
		it(`Control route ${BACKEND_VERSION_ROUTE}`, async () => {
			let json = await jsonGet(BACKEND_VERSION_ROUTE)
			expect(json).to.have.property('version')
			expect(json.version).to.be.a('string')
				.and.match(/^\d+\.\d+\.\d+$/)
		})


        const DATABASE_CHECK_VERSION = '/api/v1/check-database'
		it(`Control route ${DATABASE_CHECK_VERSION }`, async () => {
			let json = await jsonPost(DATABASE_CHECK_VERSION )
			expect(json).to.have.property('message')
			expect(json.message).to.be.a('string').and.equal('Success')
			expect(json).to.have.property('success')
			expect(json.success).to.be.a('boolean').and.equal(true)
		})

	})



})
