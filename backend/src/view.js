'use strict'

class View {

    #request = null
    #response = null

    constructor(request, response) {
        this.request = request
        this.response = response
    }

    translation(messageId, prop = {}) {
        return this.request.t(messageId, prop)
    }

    json(jsonContent) {
        // use «response.send()» instead of «response.json()» to add a CR at the end
        this.response.send(JSON.stringify(jsonContent) + '\n')
    }

    error(error) {
        const errorMessage = error.message ? error.message : error
        this.response.status(error.httpStatus || 500).send(errorMessage)
    }
}

export default View
