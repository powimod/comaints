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

    async listUnit() {
        const LIST_UNIT_ROUTE = '/api/v1/unit/list'
        const result = await this.#context.jsonGet(LIST_UNIT_ROUTE , {}, {token:true})
        return result.unitList
    }

    async getUnitById(unitId) {
        if (unitId === undefined)
            throw new Error("Argument «unit» required")
        if (isNaN(unitId))
            throw new Error("Argument «unit» is not valid")
        const GET_UNIT_ROUTE = '/api/v1/unit/{{unitId}}'
        const route = this.#context.prepareRequestPath(GET_UNIT_ROUTE, { unitId })
        const result = await this.#context.jsonGet(route, {}, {token:true})
        return result.unit
    }

    async editUnit(unit) {
        if (typeof(unit) !== 'object')
            throw new Error("Argument «unit» is not an object")
        const EDIT_UNIT_ROUTE = '/api/v1/unit/{{unitId}}'
        const route = this.#context.prepareRequestPath(EDIT_UNIT_ROUTE, { unitId: unit.id })
        const result = await this.#context.jsonPost(route, { unit }, {token:true})
        return result.unit
    }

    async deleteUnitById(unitId) {
        if (unitId === undefined)
            throw new Error("Argument «unit» required")
        if (isNaN(unitId))
            throw new Error("Argument «unit» is not valid")
        const DELETE_UNIT_ROUTE = '/api/v1/unit/{{unitId}}/delete'
        const route = this.#context.prepareRequestPath(DELETE_UNIT_ROUTE, { unitId })
        const result = await this.#context.jsonDelete(route, {token:true})
        return result.deleted
    }

}
export default UnitApi
