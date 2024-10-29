'use strict'

import Context from './Context.js'
import AuthApi from './AuthApi.js'

class ComaintBackendApi {

    #context = null
    #auth = null

    constructor(backendUrl, serializeFunction) {
        if (! backendUrl)
            throw new Error('Parameter «backendUrl» is not defined')
        if (typeof(backendUrl) !== 'string')
            throw new Error('Parameter «backendUrl» is not a string')
        if (! serializeFunction)
            throw new Error('Parameter «serializeFunction» is not defined')
        if (typeof(serializeFunction) !== 'function')
            throw new Error('Parameter «serializeFunction» is not a function')
        this.#context = new Context(backendUrl, serializeFunction)
        this.#auth = new AuthApi(this.#context)
    }

    get auth() {
        return this.#auth
    }

    checkApiLib() {
        return {success: true, message: 'Comaint api-lib is working !'}
    }

    async checkBackend() {
        const API_VERSION_ROUTE = '/api/welcome'
        try {
            const ret = await this.#context.jsonGet(API_VERSION_ROUTE)
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
        let json = await this.#context.jsonGet(API_VERSION_ROUTE)
        return json.version
    }

    async getBackendVersion() {
        const BACKEND_VERSION_ROUTE = '/api/v1/backend-version'
        let json = await this.#context.jsonGet(BACKEND_VERSION_ROUTE)
        return json.version
    }


    async checkWelcome(who) {
        const API_VERSION_ROUTE = '/api/welcome'
        if (who === undefined) {
            const ret = await this.#context.jsonGet(API_VERSION_ROUTE)
            return ret.response
        }
        else {
            if (typeof(who) !== 'object')
                throw new Error('Invalid argument')
            const firstname = who.firstname || '?'
            const lastname = who.lastname || '?'
            const ret = await this.#context.jsonPost(API_VERSION_ROUTE, {firstname, lastname})
            return ret.response
        }
    }

}
export default ComaintBackendApi
