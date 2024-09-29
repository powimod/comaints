'use strict'

import { convertObjectToDb, buildFieldArrays, controlObject } from '../../../common/src/objects/object-util.mjs'
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs'

class CompanyModel {
    #db = null

    initialize (db) {
        this.#db = db
    }

    async findCompanyList() {
		let sql = `SELECT * FROM companies`
		const result = await this.#db.query(sql)
		if (result.code)
			throw new Error(result.code)
		const companyList = []
		for (let companyRecord of result)
			companyList.push(companyRecord)
		return companyList;
    }


	async getCompanyById(companyId) {
		if (companyId === undefined)
			throw new Error('Argument <companyId> required');
		if (isNaN(companyId))
			throw new Error('Argument <companyId> is not a number');
		let sql = `SELECT * FROM companies WHERE id = ?`;
		const result = await this.#db.query(sql, [companyId]);
		if (result.code)
			throw new Error(result.code);
		if (result.length === 0)
			return null;
		const company = result[0]
        // TODO filter properties
		return company;
	}


	async createCompany(company) {
		const error = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false })
		if ( error)
			throw new Error(error)


		const companyDb = convertObjectToDb(companyObjectDef, company)

        const [ fieldNames, fieldValues ] = buildFieldArrays(companyObjectDef, companyDb)
        const markArray = Array(fieldValues.length).fill('?').join(',')

		const sqlRequest = `
			INSERT INTO companies(${fieldNames.join(', ')}) VALUES (${markArray});
		`
		const result = await this.#db.query(sqlRequest, fieldValues)
		if (result.code)
			throw new Error(result.code)
		const companyId = result.insertId
		company = this.getCompanyById(companyId)
		return company

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
