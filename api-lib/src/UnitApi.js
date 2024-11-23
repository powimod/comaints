'use strict'
import { controlObject } from '../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../common/src/objects/unit-object-def.mjs'
import { ComaintTranslatedError } from '../../common/src/error.mjs'

class UnitApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async createUnit(unit) {
        if (typeof(unit) !== 'object')
            throw new Error("Argument «unit» is not an object")
        const [ errorMsg, errorParams ] = (controlObject(unitObjectDef, unit, {fullCheck:false}))
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams)
        const CREATE_UNIT_ROUTE = '/api/v1/unit'
        const result = await this.#context.jsonPost(CREATE_UNIT_ROUTE , { unit }, {token:true})
        return result.unit
    }

    async editUnit(unit) {
        if (typeof(unit) !== 'object')
            throw new Error("Argument «unit» is not an object")
        const [ errorMsg, errorParams ] = (controlObject(unitObjectDef, unit, {fullCheck:true}))
        if (errorMsg)
            throw new ComaintTranslatedError(errorMsg, errorParams)
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

    async listUnit(page = 1) {
        const LIST_UNIT_ROUTE = '/api/v1/unit/list'
        const result = await this.#context.jsonGet(LIST_UNIT_ROUTE , {page}, {token:true})
        return {
            list: result.unitList,
            page: result.page,
            count: result.count,
            limit: result.limit
        }
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


}
export default UnitApi
