'use strict'

import assert from 'assert'

import { convertObjectToDb, buildFieldArrays, convertObjectFromDb  } 
    from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'
import { ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs'

class CompanyModel {
    #db = null

    initialize (db) {
        this.#db = db
    }

    async findCompanyList() {
        let sql = `SELECT * FROM companies`
        const result = await this.#db.query(sql)
        const companyList = []
        for (let companyRecord of result){
            const company = convertObjectFromDb(companyObjectDef, companyRecord)
            companyList.push(company)
        }
        return companyList;
    }


    async getCompanyById(companyId) {
        if (companyId === undefined)
            throw new Error('Argument <companyId> required');
        if (isNaN(companyId))
            throw new Error('Argument <companyId> is not a number');
        let sql = `SELECT * FROM companies WHERE id = ?`;
        const result = await this.#db.query(sql, [companyId]);
        if (result.length === 0)
            return null;
        const companyRecord = result[0]
        // TODO filter properties
        const company = convertObjectFromDb(companyObjectDef, companyRecord)
        return company
    }


    async createCompany(company) {
        const companyDb = convertObjectToDb(companyObjectDef, company)
        const [ fieldNames, fieldValues ] = buildFieldArrays(companyObjectDef, companyDb)
        const markArray = Array(fieldValues.length).fill('?').join(',')

        const sqlRequest = `
            INSERT INTO companies(${fieldNames.join(', ')}) VALUES (${markArray});
        `
        const result = await this.#db.query(sqlRequest, fieldValues)
        const companyId = result.insertId
        company = await this.getCompanyById(companyId)
        return company
    }

    async getManagerCount(companyId)
    {
        assert(companyId !== undefined)
        if (typeof(companyId) !== 'number')
            throw new Error('Argument <companyId> is not a number')
        const sql = `SELECT COUNT(*) AS manager_count FROM users WHERE manager = true AND id_company = ?`
        const result = await this.#db.query(sql, [companyId])
        const managerCount = result[0].manager_count
        return managerCount
    }

    async deleteCompanyById(companyId)
    {
        assert(companyId !== undefined)
        if (typeof(companyId) !== 'number')
            throw new Error('Argument <companyId> is not a number')
        const managerCount = await this.getManagerCount(companyId)
        if (managerCount > 0)
            throw new ComaintApiErrorUnauthorized('error.can_not_delete_company_with_managers')
        // delete company with cascading removal (all units, equiments, etc will be deleted)
        const sql = `DELETE FROM companies WHERE id = ?`
        const result = await this.#db.query(sql, [companyId])
        return (result.affectedRows !== 0)
    }
}


class CompanyModelSingleton {

    static #instance = null

    constructor() {
        throw new Error('Can not instanciate CompanyModelSingleton!')
    }

    static getInstance() {
        if (! CompanyModelSingleton.#instance)
            CompanyModelSingleton.#instance = new CompanyModel()
        return CompanyModelSingleton.#instance
    }
}

export default CompanyModelSingleton
