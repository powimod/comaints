'use strict'

class CompanyApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async initializeCompany(companyName) {
        const INITIALIZE_COMPANY_ROUTE = '/api/v1/company/initialize'
        const result = await this.#context.jsonPost(INITIALIZE_COMPANY_ROUTE, companyName, {token:true})
        return result.profile
    }

}
export default CompanyApi
