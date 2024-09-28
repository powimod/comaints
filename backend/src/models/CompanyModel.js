'use strict'

class CompanyModel {
    #db = null

    initialize (db) {
        this.#db = db
    }

    async findCompanyList() {
        return []
    }

}


/* TODO cleanup
const buildCompanyModel = (db) => {
    CompanyModel.initialize(db)
    return CompanyModel
}

export {buildCompanyModel }
export default CompanyModel
*/

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
