'use strict'

import assert from 'assert'

import { ComaintTranslatedError } from '../../common/src/error.mjs'

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
        this.response.set('Content-Type', 'application/json')
        this.response.send(JSON.stringify(jsonContent) + '\n')
    }

    error(error) {
        if (error === undefined)
            throw new Error('Error parameter is not defined')
        if (error === null)
            throw new Error('Error parameter is null')
        let errorMessage
        if (error instanceof ComaintTranslatedError)
            errorMessage = error.translate(this.request.t)
        else if (error instanceof Error)
            errorMessage = error.message
        else if (typeof(error) === 'string')
            errorMessage = error
        else if (error instanceof Object)
            throw new Error(`Invalid error parameter (${error.constructor.name})`)
        else
            throw new Error(`Invalid error parameter`)
        this.response.set('Content-Type', 'application/json')
        this.response.status(error.httpStatus || 500).send({error: errorMessage})
    }
}

export default View
