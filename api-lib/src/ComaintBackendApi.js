'use strict'

class ComaintBackendApi {

    #backendUrl = null

    constructor(backendUrl) {
        if (! backendUrl)
            throw new Error('Parameter «backendUrl» not defined')
        this.#backendUrl = backendUrl
    }


    checkApiLib() {
        return { success: true, message: 'Comaint api-lib is working !'}
    }

}
export default ComaintBackendApi
