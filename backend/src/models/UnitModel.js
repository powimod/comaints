'use strict'

import assert from 'assert'

import { buildFieldArrays, controlObject, convertObjectFromDb } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'
import { comaintErrors, buildComaintError } from '../../../common/src/error.mjs'
import { AccountState } from '../../../common/src/global.mjs'

class UnitModel {
    #db = null

    initialize (db) {
        assert (db !== undefined)
        this.#db = db
    }

    async findUnitList() {
        let sql = `SELECT * FROM units ORDER BY name`
        const result = await this.#db.query(sql)
        const unitList = []
        for (let unitRecord of result) {
            const unit = convertObjectFromDb(unitObjectDef, unitRecord)
            unitList.push(unit)
        }
        return unitList
    }


    async getUnitById(unitId) {
        if (unitId === undefined)
            throw new Error('Argument <unitId> required')
        if (isNaN(unitId))
            throw new Error('Argument <unitId> is not a number')
        let sql = `SELECT * FROM units WHERE id = ?`
        const result = await this.#db.query(sql, [unitId])
        if (result.length === 0)
            return null
        const unitRecord = result[0]
        const unit = convertObjectFromDb(unitObjectDef, unitRecord)
        // TODO filter properties
        return unit
    }

    async getUnitByName(name) {
        if (name === undefined)
            throw new Error('Argument <name> required')
        let sql = `SELECT * FROM units WHERE name = ?`
        const result = await this.#db.query(sql, [name])
        if (result.length === 0)
            return null
        const unitRecord = result[0]
        const unit = convertObjectFromDb(unitObjectDef, unitRecord)
        // TODO filter properties
        return unit
    }

    async createUnit(unit) {
        const [ fieldNames, fieldValues ] = buildFieldArrays(unitObjectDef, unit)
        const markArray = Array(fieldValues.length).fill('?').join(',')
        const sqlRequest = `
            INSERT INTO units(${fieldNames.join(', ')}) VALUES (${markArray})
        `
        try {
            const result = await this.#db.query(sqlRequest, fieldValues)
            const unitId = result.insertId
            unit = await this.getUnitById(unitId)
            return unit
        }
        catch (error) {
            // TODO duplicated code
            if (error.code === 'ER_DUP_ENTRY') {
                const match = error.message.match(/Duplicate entry '.*' for key '(\w+)'/)
                if (match) {
                    let field = match[1]
                    if (field.startsWith("idx_"))
                        field = field.slice(4)
                    error = buildComaintError(comaintErrors.CONFLICT_ERROR, {field, object: 'unit'})
                }
            }
            throw error
        }
    }


    async editUnit(unit) {
        const [ fieldNames, fieldValues ] = buildFieldArrays(unitObjectDef, unit)
        const sqlRequest = `UPDATE units SET ${fieldNames.map(field => `${field}=?`).join(', ')} WHERE id = ?`
        fieldValues.push(unit.id) // WHERE clause

        const result = await this.#db.query(sqlRequest, fieldValues)
        const unitId = unit.id
        unit = this.getUnitById(unitId)
        return unit
    }

    async deleteUnitById(unitId){
        assert(unitId !== undefined)
        if (typeof(unitId) !== 'number')
            throw new Error('Argument <unitId> is not a number');
        const sql = `DELETE FROM units WHERE id = ?`;
        const result = await this.#db.query(sql, [unitId]);
        return (result.affectedRows !== 0)
    }
}


class UnitModelSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate UnitModelSingleton!')
    }

    static getInstance() {
        if (! UnitModelSingleton.#instance)
            UnitModelSingleton.#instance = new UnitModel()
        return UnitModelSingleton.#instance
    }
}

export default UnitModelSingleton
