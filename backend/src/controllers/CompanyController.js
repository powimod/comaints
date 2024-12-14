'use strict';
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObject, controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs';


class CompanyController {
    static #instance = null

    #model = null;
    #companyModel = null;
    #userModel = null;

    constructor() {
        if (CompanyController.#instance !== null)
            throw new Error("Can not instanciate CompanyController. Use CompanyController.getInstance()");
    }

    static getInstance() {
        if (! CompanyController.#instance)
            CompanyController.#instance = new CompanyController();
        return CompanyController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#companyModel = this.#model.getCompanyModel();
        this.#userModel = this.#model.getUserModel();
    }

    async findCompanyList(properties, filters, pagination, view) {
        assert(properties !== undefined);
        assert(filters !== undefined);
        assert(pagination !== undefined);
        assert(view !== undefined);

        try {
            const result = await this.#companyModel.findCompanyList(properties, filters, pagination);
            view.json(result);
        }
        catch(error) {
            view.error(error);
        }
    }

    async createCompany(company, view) {
        assert(company !== undefined);
        assert(view !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

            company = await this.#companyModel.createCompany(company);

            // TODO filter protected properties

            view.json({company});
        }
        catch(error) {
            view.error(error);
        }
    }


    async initializeCompany(companyName, userId, view, postInitCallback) {
        assert(companyName !== undefined);
        assert(userId !== undefined);
        assert(view !== undefined);
        assert(postInitCallback !== undefined);
        try {
            let user = await this.#userModel.getUserById(userId);
            assert(user !== null);
            if (user.companyId)
                throw new ComaintApiErrorInvalidRequest('error.company_already_initialized');

            const [ errorMsg, errorParam ] = controlObjectProperty(companyObjectDef, 'name', companyName);
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

            let company = {
                managerId: userId,
                name: companyName
            };
            company = await this.#companyModel.createCompany(company);

            user.companyId = company.id;
            user = await this.#userModel.editUser(user);

            await postInitCallback(user);

            company = buildPublicObjectVersion(companyObjectDef, company);
            view.json({company});
        }
        catch(error) {
            view.error(error);
        }
    }


    async getCompanyById(companyId, view, controlAccess) {
        assert(companyId !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);
        try {
            let company = await this.#companyModel.getCompanyById(companyId);
            if (company && ! controlAccess(company))
                company = null;
            view.json({company});
        }
        catch(error) {
            console.log(error)
            view.error(error);
        }
    }

    async editCompany(company, view, controlAccess) {
        assert(company !== undefined);
        assert(view !== undefined);
        assert(controlAccess !== undefined);

        try {
            const [ errorMsg, errorParam ] = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false });
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);
            let controlCompany = await this.#companyModel.getCompanyById(company.id);
            if (controlCompany && ! controlAccess(controlCompany))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            company = await this.#companyModel.editCompany(company);
            view.json({company});
        }
        catch(error) {
            view.error(error);
        }
    }

    async deleteCompanyById(companyId, view, controlAccess) {
        assert(companyId !== undefined);
        assert(view !== undefined);
        try {
            let company = await this.#companyModel.getCompanyById(companyId);
            if (company === null)
                throw new ComaintApiErrorUnauthorized('error.not_found');
            if (! controlAccess(company))
                throw new ComaintApiErrorUnauthorized('error.not_owner');
            const deleted = await this.#companyModel.deleteCompanyById(companyId);
            view.json({deleted});
        }
        catch(error) {
            view.error(error);
        }
    }
}



export default CompanyController;
