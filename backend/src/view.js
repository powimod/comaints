'use strict'

import assert from 'assert'

import { ComaintTranslatedError, comaintErrors } from '../../common/src/error.mjs'

class View {
    #request = null
    #response = null
    #renewedAccessToken = null
    #renewedRefreshToken = null

    constructor(request, response) {
        this.request = request
        this.response = response
        // ensure that the translation function is mapped to this class
        this.translation = this.translation.bind(this)
    }

    translation(messageId, prop = {}) {
        // operator «this» should be undefined if bind function was not called in constructor
        assert (this !== undefined)
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

    error(error, options = {}) {
        const resetTokens = options.resetTokens || false
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

        const errorId = error.errorId || comaintErrors.INTERNAL_ERROR

        const jsonBody = {
            error: errorId,
            message: errorMessage
        }

        if (resetTokens) {
            jsonBody['access-token'] = null
            jsonBody['refresh-token'] = null
        }
        else {
            if (this.#renewedAccessToken !== null)
                jsonBody['access-token'] = this.#renewedAccessToken
            if (this.#renewedRefreshToken !== null)
                jsonBody['refresh-token'] = this.#renewedRefreshToken
        }

        this.response.status(error.httpStatus || 500).send(jsonBody)
    }

    storeRenewedTokens(accessToken, refreshToken) {
        this.#renewedAccessToken = accessToken
        this.#renewedRefreshToken = refreshToken
    }
}

export default View
