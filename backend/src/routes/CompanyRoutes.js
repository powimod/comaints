
import assert from 'assert';

import CompanyController from '../controllers/CompanyController.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';
import requireUserAuthMiddleware from '../middlewares/requireUserAuthMiddleware.js';
import requestPaginationMiddleware from '../middlewares/requestPaginationMiddleware.js';
import requestFiltersMiddleware from '../middlewares/requestFiltersMiddleware.js';
import requestPropertiesMiddleware from '../middlewares/requestPropertiesMiddleware.js';
import renewTokensMiddleware from '../middlewares/renewTokensMiddleware.js';
import renewContextMiddleware from '../middlewares/renewContextMiddleware.js';

import { controlObject, controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import companyObjectDef from '../../../common/src/objects/company-object-def.mjs';

class CompanyRoutes {

    initialize(expressApp) {
        const companyController = CompanyController.getInstance();

        // company list route
	    expressApp.get('/api/v1/company/list', requireAdminAuthMiddleware, requestPropertiesMiddleware, requestPaginationMiddleware, async (request, response) => {
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);
            const view = request.view;

            await companyController.findCompanyList(properties, filters, pagination, view);
        });


        // create company route
        expressApp.post('/api/v1/company', requireAdminAuthMiddleware, async (request, response) => {
            const view = request.view;
            try {
                let company = request.body.company;
                if (company === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'company'});
                if (typeof(company) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'company'});
                const [ errorMsg, errorParam ] = controlObject(companyObjectDef, company, { fullCheck:true, checkId:false });
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

                await companyController.createCompany(company, view);
            }
            catch(error) {
                view.error(error);
            }
        });

        // initialize company route
        expressApp.post('/api/v1/company/initialize', requireUserAuthMiddleware, async (request, response) => {
            const view = request.view;
            try {
                assert(request.userId);
                const userId = request.userId;

                if (request.companyId)
                    throw new ComaintApiErrorInvalidRequest('error.company_already_initialized');

                let companyName = request.body.companyName;
                if (companyName === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'companyName'});

                await companyController.initializeCompany(companyName, userId, view, async user => {
                    request.companyId = user.companyId;
                    await renewTokensMiddleware(request);
                    await renewContextMiddleware(request, user);
                });
            }
            catch(error) {
                view.error(error);
            }
        });

    }
}

class CompanyRoutesSingleton {

    static #instance = null;

	constructor() {
		throw new Error('Can not instanciate CompanyRoutesSingleton!');
	}

	static getInstance() {
		if (! CompanyRoutesSingleton.#instance)
			CompanyRoutesSingleton.#instance = new CompanyRoutes();
		return CompanyRoutesSingleton.#instance;
	}
}

export default CompanyRoutesSingleton; 
