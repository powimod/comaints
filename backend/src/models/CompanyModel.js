'use strict'

class CompanyModel {
    static #db = null

    static initialize = (db) => {
        CompanyModel.#db = db
    }

    static async findCompanyList() {
        return []
    }

}


const buildCompanyModel = (db) => {
    CompanyModel.initialize(db)
    return CompanyModel
}

export {buildCompanyModel }
export default CompanyModel
