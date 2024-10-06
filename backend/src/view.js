'use strict'

import assert from 'assert'

import { ComaintApiError } from '../../common/src/error.mjs'

class View {

    #request = null
    #response = null
    #userId = null
    #companyId = null

    constructor(request, response) {

        // request.userId and request.companyId are defined by the cookie middleware in AuthRoute
        assert(request.userId !== undefined)
        assert(request.companyId !== undefined)
        this.userId = request.userId
        this.companyId = request.companyId

        this.request = request
        this.response = response

        // ensure that the translation function is mapped to this class
        this.translation = this.translation.bind(this)
    }

    getRequestUserId() {
        return this.#userId
    }

    getRequestCompanyId() {
        return this.#companyId
    }

    translation(messageId, prop = {}) {
        // operator «this» should be undefined if bind function was not called in constructor
        if (this === undefined)
            throw new Error('Translation function not mapped to view')
        if (this.request === undefined)
            throw new Error('Request is not initialized in view')
        if (this.request.t === undefined)
            throw new Error('Request translation function is not initialized in view')
        return this.request.t(messageId, prop)
    }

    json(jsonContent) {
        // use «response.send()» instead of «response.json()» to add a CR at the end
        this.response.send(JSON.stringify(jsonContent) + '\n')
    }

    error(error) {
        let errorMessage
        if (error instanceof ComaintApiError)
            errorMessage = error.translate(this.request.t)
        else
            errorMessage = error.message ? error.message : error
        this.response.status(error.httpStatus || 500).send(errorMessage)
    }
}

export default View
