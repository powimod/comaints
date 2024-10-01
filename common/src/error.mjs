'use strict'

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
        super(msgId, msgParams, 'NotFound', 404)
    }
}

class ComaintApiErrorInvalidRequest extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, 'InvalidRequest', 400)
    }
}


class ComaintApiErrorConflict extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, 'Conflict', 409)
    }
}


class ComaintApiErrorInternalError extends ComaintApiError {
    constructor(msgId, msgParams) {
        super(msgId, msgParams, 'InternalError', 500)
    }
}

export {
    ComaintTranslatedError,
    ComaintApiError,
    ComaintApiErrorNotFound,
    ComaintApiErrorInvalidRequest,
    ComaintApiErrorConflict,
    ComaintApiErrorInternalError
}
