'use strict';

import { expect } from 'chai';

import { api, initializeApi, terminateApi } from './util.js';


describe('Check API version', () => {

	before( async () =>  {
		await initializeApi();
	});

    after( async () =>  {
        await terminateApi();
    });

    it('Check library', () => {
        let response = api.checkApiLib();
        expect(response).to.be.instanceOf(Object);
        expect(response).to.have.property('success');
        expect(response.success).to.be.a('boolean').and.to.equal(true);
        expect(response).to.have.property('message');
        expect(response.message).to.be.a('string').and.to.equal('Comaint api-lib is working !');
    });

    it('Check communication with backend', async () => {
        let response = await api.checkBackend();
        expect(response).to.be.instanceOf(Object);
        expect(response).to.have.property('success');
        expect(response.success).to.be.a('boolean').and.to.equal(true);
        expect(response).to.have.property('message');
        expect(response.message).to.be.a('string').and.to.equal('Comaint backend communication is working !');
    });

    it('Check welcome message', async () => {
        let response = await api.welcome();
        expect(response).to.be.a('string').and.to.equal('Welcome');
        response = await api.welcome({firstname:'Bonnie', lastname:'Parker'});
        expect(response).to.be.a('string').and.to.equal('Hello Bonnie Parker');
    });

});
