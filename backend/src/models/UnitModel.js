'use strict'

import assert from 'assert'

import { buildFieldNameArray, buildFieldArrays, convertObjectFromDb } from '../../../common/src/objects/object-util.mjs'
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs'
import { convertError } from '../../../common/src/error.mjs'

const defaultResultPropertyList = [ 'id', 'name' ]
const defaultOrderPropertyList = [ 'name', 'description' ]

class UnitModel {
    #db = null

    initialize (db) {
        assert (db !== undefined)
        this.#db = db
    }

    async findUnitList(properties = null, filters = null, pagination = null) {
        assert(this.#db !== null)
        if (properties === null)
            properties = defaultResultPropertyList
        if (!(properties instanceof Array))
            throw new Error("Parameter «properties» is not an array")
        if (typeof(filters) !== 'object')
            throw new Error("Parameter «filters» is not an object")

        const sqlFields = buildFieldNameArray(unitObjectDef, properties)
        if (sqlFields.length === 0)
            throw new Error("No request properties found")

        const [ fieldNames, fieldValues ] = buildFieldArrays(unitObjectDef, filters)
        const sqlWhere = fieldNames.length === 0 ? '' :
            'WHERE ' + fieldNames.map(f => `${f} = ?`).join(' AND ')

        const sortProperties = defaultOrderPropertyList
        const sortFieldNames = buildFieldNameArray(unitObjectDef, sortProperties)
        const sqlSort = sortFieldNames.map === 0 ? '' :
            'ORDER BY ' + sortFieldNames.map(f => `${f}`).join(', ')

        // get record counts
        let sql = `SELECT COUNT(*) as count FROM units ${sqlWhere}`
        const result = await this.#db.query(sql, fieldValues)
        let recordCount = result[0]['count']

        const unitList = []

        // get record of selected page
        if ( recordCount > 0 ) {
            sql = `SELECT ${sqlFields} FROM units ${sqlWhere} ${sqlSort} LIMIT ? OFFSET ?`
            console.log("dOm sql", sql)
            console.log("dOm params", fieldValues)
            fieldValues.push(pagination.limit, pagination.offset)
            const result = await this.#db.query(sql, fieldValues)

            for (let unitRecord of result) {
                const unit = convertObjectFromDb(unitObjectDef, unitRecord)
                unitList.push(unit)
            }
        }

        return {
            unitList,
            page: pagination.page,
            limit: pagination.limit,
            count: recordCount
        }
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
            throw convertError(error)
        }
    }


    async editUnit(unit) {
        const [ fieldNames, fieldValues ] = buildFieldArrays(unitObjectDef, unit)
        const sqlRequest = `UPDATE units SET ${fieldNames.map(field => `${field}=?`).join(', ')} WHERE id = ?`
        fieldValues.push(unit.id) // WHERE clause
        try {
            await this.#db.query(sqlRequest, fieldValues)
            const unitId = unit.id
            unit = this.getUnitById(unitId)
            return unit
        }
        catch (error) {
            throw convertError(error)
        }
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
