'use strict';
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObject } from '../../../common/src/objects/object-util.mjs';
import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs';

import requireUserWithCompanyAuthMiddleware from '../middlewares/requireUserWithCompanyAuthMiddleware.js';
import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';
import requireUserAuthMiddleware from '../middlewares/requireUserAuthMiddleware.js';
import renewTokensMiddleware from '../middlewares/renewTokensMiddleware.js';
import renewContextMiddleware from '../middlewares/renewContextMiddleware.js';
import requestPaginationMiddleware from '../middlewares/requestPaginationMiddleware.js';
import requestFiltersMiddleware from '../middlewares/requestFiltersMiddleware.js';
import requestPropertiesMiddleware from '../middlewares/requestPropertiesMiddleware.js';

class UnitRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance();
        const unitModel = model.getUnitModel();

        expressApp.get('/api/v1/unit/list', requireUserWithCompanyAuthMiddleware, requestPropertiesMiddleware, requestPaginationMiddleware, async (request, _) => {
            const view = request.view;
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);

            // for non admin users, add a filter on user company
            const filters = {}
            if (request.companyId !== null)
                filters.companyId = request.companyId;

            try {
                const result = await unitModel.findUnitList(properties, filters, pagination);
                view.json(result);
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/unit/search', requireUserWithCompanyAuthMiddleware, requestPropertiesMiddleware, requestFiltersMiddleware, requestPaginationMiddleware,  async (request) => {
            const view = request.view;
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const filters = request.requestFilters;
            assert(filters !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);

            // for non admin users, add a filter on user company
            if (request.companyId !== null)
                filters.companyId = request.companyId;

            try {
                const result = await unitModel.findUnitList(properties, filters, pagination);
                view.json(result);
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/unit', requireUserWithCompanyAuthMiddleware, async (request) => {
            const view = request.view;
            try {
                if (request.isAdministrator === false && request.companyId === null)
                    throw new ComaintApiErrorUnauthorized('error.user_not_logged_in');

                let unit = request.body.unit;
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'unit'});
                if (typeof(unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'unit'});

                // for non admin users, force user company ID
                if (request.companyId !== null)
                    unit.companyId = request.companyId

                const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false });
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

                unit = await unitModel.createUnit(unit);

                // TODO filter protected properties

                view.json({unit});
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.get('/api/v1/unit/:id', requireUserWithCompanyAuthMiddleware, async (request) => {
            const unitId = request.params.id;
            const view = request.view;
            try {
                assert(request.userId);
                let unit = await unitModel.getUnitById(unitId);

                // silently ignore tentative to access not owned unit
                if (unit !== null && request.isAdministrator === false && unit.companyId !== request.companyId)
                    unit = null;
                view.json({unit});
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/unit/:id', requireUserWithCompanyAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;

            try {
                let unitId = request.params.id;
                if (isNaN(unitId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'id'});
                unitId = parseInt(unitId);

                let unit = request.body.unit;
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'unit'});
                if (typeof(unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'unit'});

                if (unit.id !== unitId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', { object: 'unit', id: 'id'});

                if (unit.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');

                const [ errorMsg, errorParam ] = controlObject(unitObjectDef, unit, { fullCheck:true, checkId:false });
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

                unit = await unitModel.editUnit(unit);
                view.json({unit});
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.delete('/api/v1/unit/:id/delete', requireUserWithCompanyAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;
            try {
                let unitId = request.params.id;
                if (isNaN(unitId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'id'});
                unitId = parseInt(unitId);

                let unit = await unitModel.getUnitById(unitId);
                if (unit === null)
                    throw new ComaintApiErrorUnauthorized('error.not_found');

                if (unit.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');
                unit = null;

                const deleted = await unitModel.deleteUnitById(unitId);
                view.json({deleted});
            }
            catch(error) {
                view.error(error);
            }
        });


    }
}

class UnitRoutesSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate UnitRoutesSingleton!');
    }

    static getInstance() {
        if (! UnitRoutesSingleton.#instance)
            UnitRoutesSingleton.#instance = new UnitRoutes();
        return UnitRoutesSingleton.#instance;
    }
}

export default UnitRoutesSingleton;
