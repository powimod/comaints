'use strict'

class ComaintApiError extends Error {
    constructor(message, errorId, httpStatus) {
        super(message)
        this.httpStatus = httpStatus
        this.errorId = errorId
    }
}

class ComaintApiErrorNotFound extends ComaintApiError {
    constructor(message) {
        super(message, 'NotFound', 404)
    }
}

class ComaintApiErrorInvalidRequest extends ComaintApiError {
    constructor(message) {
        super(message, 'InvalidRequest', 400)
    }
}


class ComaintApiErrorConflict extends ComaintApiError {
    constructor(message) {
        super(message, 'Conflict', 409)
    }
}


class ComaintApiErrorInternalError extends ComaintApiError {
    constructor(message) {
        super(message, 'InternalError', 500)
    }
}

export {
    ComaintApiError,
    ComaintApiErrorNotFound,
    ComaintApiErrorInvalidRequest,
    ComaintApiErrorConflict,
    ComaintApiErrorInternalError
}
