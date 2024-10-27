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
        return {success: true, version: json.version}
    }

    async getBackendVersion() {
        const BACKEND_VERSION_ROUTE = '/api/v1/backend-version'
        let json = await this.#context.jsonGet(BACKEND_VERSION_ROUTE)
        return {success: true, version: json.version}
    }


    async welcome(args) {
        const WELCOME_ROUTE = '/api/welcome'
        try  {
            let ret
            if (args !== undefined) {
                if (typeof(args) !== 'object')
                    throw new Error('Argument is not an object')
                /*
                if (! args.firstname)
                    throw new Error('Argument «firstname» not defined')
                if (! args.lastname)
                    throw new Error('Argument «firstname» not defined')
                */
                ret = await this.#context.jsonPost(WELCOME_ROUTE, args)
            }
            else {
                ret = await this.#context.jsonGet(WELCOME_ROUTE)
            }
            console.log("dOm retour", ret)
            return {success: true, message: ret.message} 
        }
        catch (error) {
            const message = error.message === undefined ? error : error.message
            return {success: false, message }
        }

    }

}
export default ComaintBackendApi
