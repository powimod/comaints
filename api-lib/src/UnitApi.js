'use strict'

class UnitApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async createUnit(unit) {
        if (typeof(unit) !== 'object')
            throw new Error("Argument «unit» is not an object")
        const CREATE_UNIT_ROUTE = '/api/v1/unit'
        const result = await this.#context.jsonPost(CREATE_UNIT_ROUTE , { unit }, {token:true})
        return result.unit
    }

}
export default UnitApi
