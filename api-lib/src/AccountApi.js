'use strict'

class AccountApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    // parameters argument is used by self-test to send «expiredAccessTokenEmulation» option
    async getProfile(parameters = {}) {
        const PROFILE_ROUTE = '/api/v1/account/profile'
        const result = await this.#context.jsonGet(PROFILE_ROUTE, parameters, {token:true})
        return result.profile
    }

}
export default AccountApi
