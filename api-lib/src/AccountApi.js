'use strict'

class AccountApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async getProfile(parameters, options) {
        const PROFILE_ROUTE = '/api/v1/account/profile'
        const result = await this.#context.jsonGet(PROFILE_ROUTE, parameters, options)
        return result.profile
    }


}
export default AccountApi
