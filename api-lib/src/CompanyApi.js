'use strict';

class CompanyApi {

    #context = null;

    constructor(context) {
        this.#context = context;
    }

    async initializeCompany(companyName) {
        if (companyName === undefined)
            throw new Error('Argument «companyName» is missing');
        if (typeof(companyName) !== 'string')
            throw new Error('Invalid argument «companyName»');
        const INITIALIZE_COMPANY_ROUTE = '/api/v1/company/initialize';
        const result = await this.#context.jsonPost(INITIALIZE_COMPANY_ROUTE, { companyName }, {token:true});
        return result.company;
    }

}
export default CompanyApi;
