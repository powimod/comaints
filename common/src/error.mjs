'use strict'

const comaintErrors = {
    NOT_FOUND_ERROR: 'NotFoundError',
    INVALID_REQUEST_ERROR: 'InvalidRequestError',
    UNAUTHORIZED_ERROR: 'UnauthorizedError',
    INVALID_EMAIL_OR_PASSWORD: 'InvalidEmailOrPassword',
    CONFLICT_ERROR: 'ConflictError',
    INTERNAL_ERROR: 'InternalError',
    INVALID_TOKEN: 'InvalidToken',
    INVALID_RESPONSE: 'InvalidResponse'
}

class ComaintTranslatedError extends Error {

    constructor(msgId, msgParams = {}, i18nFunction = null) {
        super()
        this.msgId = msgId
        this.msgParams = msgParams
        this.message = i18nFunction ? i18nFunction(msgId, msgParams) : `Error ${msgId}`
    }

    translate(i18nFunction) {
        return i18nFunction(this.msgId, this.msgParams)
    }
}


class ComaintApiError extends ComaintTranslatedError {
    constructor(msgId, msgParams, errorId, httpStatus) {
        super(msgId, msgParams)
        this.httpStatus = httpStatus
        this.errorId = errorId
    }
}

class ComaintApiErrorNotFound extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, comaintErrors.NOT_FOUND_ERROR, 404)
    }
}

class ComaintApiErrorInvalidRequest extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, comaintErrors.INVALID_REQUEST_ERROR, 400)
    }
}

class ComaintApiErrorUnauthorized extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, comaintErrors.UNAUTHORIZED_ERROR, 401)
    }
}

class ComaintApiErrorConflict extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, comaintErrors.CONFLICT_ERROR, 409)
    }
}


class ComaintApiErrorInternalError extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, comaintErrors.INTERNAL_ERROR, 500)
    }
}

class ComaintApiErrorInvalidToken extends ComaintApiError {
    constructor() {
        super('error.invalid_token', {}, comaintErrors.INVALID_TOKEN, 401)
    }
}

class ComaintApiErrorInvalidResponse extends ComaintApiError {
    constructor() {
        super('error.invalid_response', {}, comaintErrors.INVALID_RESPONSE, 500)
    }
}


const buildComaintError = (comaintErrorCode, params = {}) => {
    // FIXME replace switch with a «errorClass» property in comaintErrors 
    
    switch (comaintErrorCode) {
        case comaintErrors.NOT_FOUND_ERROR:
            return new ComaintApiErrorNotFound('error.not_found_error', params)
        case comaintErrors.INVALID_REQUEST_ERROR:
            return new ComaintApiErrorInvalidRequest('error.invalid_request_error', params)
        case comaintErrors.UNAUTHORIZED_ERROR:
            return new ComaintApiErrorUnauthorized('error.unauthorized_error', params)
        case comaintErrors.CONFLICT_ERROR:
            return new ComaintApiErrorConflict('error.confict_error', params)
        case comaintErrors.INTERNAL_ERROR:
            return new ComaintApiErrorInternalError('error.internal_error', params)
        case comaintErrors.INVALID_TOKEN:
            return new ComaintApiErrorInvalidToken()
        case comaintErrors.INVALID_RESPONSE:
            return new ComaintApiErrorInvalidResponse()
        default:
            throw new Error(`Invalid comaint error code «${comaintErrorCode}»`)
    }
}

export {
    comaintErrors,
    ComaintTranslatedError,
    ComaintApiError,
    ComaintApiErrorNotFound,
    ComaintApiErrorInvalidRequest,
    ComaintApiErrorUnauthorized,
    ComaintApiErrorConflict,
    ComaintApiErrorInternalError,
    ComaintApiErrorInvalidToken,
    ComaintApiErrorInvalidResponse,
    buildComaintError
}
