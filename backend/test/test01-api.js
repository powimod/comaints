'use strict'

import { expect } from 'chai';

import { loadConfig, jsonGet } from './util.js'

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

	})
})

