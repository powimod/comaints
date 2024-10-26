'use strict'

import { jsonGet, jsonPost } from './util.js'
import AuthApi from './AuthApi.js'

class ComaintBackendApi {

    #backendUrl = null
    #auth = null

    constructor(backendUrl) {
        if (! backendUrl)
            throw new Error('Parameter «backendUrl» not defined')
        this.#backendUrl = backendUrl
        this.#auth = new AuthApi(backendUrl)
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
            const ret = await jsonGet(this.#backendUrl, API_VERSION_ROUTE)
            return {success: true, message: 'Comaint backend communication is working !'}
        }
        catch (error) {
            const message = error.message === undefined ? error : error.message
            return {success: false, message: `Can't communicate with backend ${this.#backendUrl} (${message})`}
        }
    }

    async getApiVersion() {
        const API_VERSION_ROUTE = '/api/version'
        // TODO catch errors
        let json = await jsonGet(this.#backendUrl, API_VERSION_ROUTE)
        return {success: true, version: json.version}
    }

    async getBackendVersion() {
        const BACKEND_VERSION_ROUTE = '/api/v1/backend-version'
        let json = await jsonGet(this.#backendUrl, BACKEND_VERSION_ROUTE)
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
                ret = await jsonPost(this.#backendUrl, WELCOME_ROUTE, args)
            }
            else {
                ret = await jsonGet(this.#backendUrl, WELCOME_ROUTE)
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
