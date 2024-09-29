'use strict'

class ComaintError extends Error {
    constructor(message, errorId, httpStatus) {
        super(message)
        this.httpStatus = httpStatus
        this.errorId = errorId
    }
}

class ComaintErrorNotFound extends ComaintError {
    constructor(message) {
        super(message, 'NotFound', 404)
    }
}

class ComaintErrorInvalidRequest extends ComaintError {
    constructor(message) {
        super(message, 'InvalidRequest', 400)
    }
}


class ComaintErrorConflict extends ComaintError {
    constructor(message) {
        super(message, 'Conflict', 409)
    }
}


class ComaintErrorInternalError extends ComaintError {
    constructor(message) {
        super(message, 'InternalError', 500)
    }
}

export {
    ComaintError,
    ComaintErrorNotFound,
    ComaintErrorInvalidRequest,
    ComaintErrorConflict,
    ComaintErrorInternalError
}
