'use strict'

import Context from './Context.js'
import AuthApi from './AuthApi.js'
import AccountApi from './AccountApi.js'

class ComaintBackendApi {

    #context = null
    #auth = null
    #account = null

    constructor(backendUrl, contextInfoCallback = null, accountSerializeCallback = null) {
        if (! backendUrl)
            throw new Error('Parameter «backendUrl» is not defined')
        if (typeof(backendUrl) !== 'string')
            throw new Error('Parameter «backendUrl» is not a string')

        if (contextInfoCallback !== null && typeof(contextInfoCallback ) !== 'function')
            throw new Error('Parameter «contextInfoCallback » is not a function')
        if (accountSerializeCallback !== null && typeof(accountSerializeCallback) !== 'function')
            throw new Error('Parameter «accountSerializeCallback» is not a function')

        this.#context = new Context(backendUrl, contextInfoCallback, accountSerializeCallback)
        this.#auth = new AuthApi(this.#context)
        this.#account = new AccountApi(this.#context)
    }

    get auth() {
        return this.#auth
    }

    get account() {
        return this.#account
    }

    checkApiLib() {
        return {success: true, message: 'Comaint api-lib is working !'}
    }

    async checkBackend() {
        const API_VERSION_ROUTE = '/api/welcome'
        try {
            const ret = await this.#context.jsonGet(API_VERSION_ROUTE, null, {token:false})
            return {success: true, message: 'Comaint backend communication is working !'}
        }
        catch (error) {
            const message = error.message === undefined ? error : error.message
            return {success: false, message: `Can't communicate with backend (${message})`}
        }
    }


    async getApiVersion() {
        const API_VERSION_ROUTE = '/api/version'
        // TODO catch errors
        let json = await this.#context.jsonGet(API_VERSION_ROUTE, null, {token:false})
        return json.version
    }

    async getBackendVersion() {
        const BACKEND_VERSION_ROUTE = '/api/v1/backend-version'
        let json = await this.#context.jsonGet(BACKEND_VERSION_ROUTE, null, {token:false})
        return json.version
    }


    async checkWelcome(who) {
        const API_VERSION_ROUTE = '/api/welcome'
        if (who === undefined) {
            const ret = await this.#context.jsonGet(API_VERSION_ROUTE, null, {token:false})
            return ret.response
        }
        else {
            if (typeof(who) !== 'object')
                throw new Error('Invalid argument')
            const firstname = who.firstname || '?'
            const lastname = who.lastname || '?'
            const ret = await this.#context.jsonPost(API_VERSION_ROUTE, {firstname, lastname}, {token:false})
            return ret.response
        }
    }

}
export default ComaintBackendApi
