'use strict'

import { expect } from 'chai'

import { initializeApi } from './util.js'


describe('Check API version', () => {

    let api = null

	before( () =>  {
		api = initializeApi()
	}),

    it('Check library', () => {
        let response = api.checkApiLib()
        expect(response).to.be.instanceOf(Object)
        expect(response).to.have.property('success')
        expect(response.success).to.be.a('boolean').and.to.equal(true)
        expect(response).to.have.property('message')
        expect(response.message).to.be.a('string').and.to.equal('Comaint api-lib is working !')
    })

})
