
import assert from 'assert';

import UnitController from '../controllers/UnitController.js';
import {ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized} from '../../../common/src/error.mjs';
//import { controlObject } from '../../../common/src/objects/object-util.mjs';
//import unitObjectDef from '../../../common/src/objects/unit-object-def.mjs';

import requireUserWithCompanyAuthMiddleware from '../middlewares/requireUserWithCompanyAuthMiddleware.js';
import requestPaginationMiddleware from '../middlewares/requestPaginationMiddleware.js';
import requestFiltersMiddleware from '../middlewares/requestFiltersMiddleware.js';
import requestPropertiesMiddleware from '../middlewares/requestPropertiesMiddleware.js';

class UnitRoutes {

    initialize(expressApp) {
        const unitController = UnitController.getInstance();

        // unit list route
        expressApp.get('/api/v1/unit/list', requireUserWithCompanyAuthMiddleware, requestPropertiesMiddleware, requestPaginationMiddleware, async (request, _) => {
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);
            const view = request.view;

            // for non admin users, add a filter on user company
            const filters = {};
            if (request.companyId !== null)
                filters.companyId = request.companyId;

            await unitController.findUnitList(properties, filters, pagination, view);
        });


        // unit search route
        expressApp.post('/api/v1/unit/search', requireUserWithCompanyAuthMiddleware, requestPropertiesMiddleware, requestFiltersMiddleware, requestPaginationMiddleware, async (request) => {
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const filters = request.requestFilters;
            assert(filters !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);
            const view = request.view;

            // for non admin users, add a filter on user company
            if (request.companyId !== null)
                filters.companyId = request.companyId;

            await unitController.findUnitList(properties, filters, pagination, view);
        });


        // create unit route
        expressApp.post('/api/v1/unit', requireUserWithCompanyAuthMiddleware, async (request) => {
            const view = request.view;

            try {
                if (request.isAdministrator === false && request.companyId === null)
                    throw new ComaintApiErrorUnauthorized('error.user_not_logged_in');

                let unit = request.body.unit;
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', {parameter: 'unit'});
                if (typeof (unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'unit'});

                // for non admin users, force user company ID
                if (request.companyId !== null)
                    unit.companyId = request.companyId;

                await unitController.createUnit(unit, view);
            }
            catch (error) {
                view.error(error);
            }
        });

        // get unit by ID route
        expressApp.get('/api/v1/unit/:id', requireUserWithCompanyAuthMiddleware, async (request) => {
            const unitId = request.params.id;
            assert(request.userId);
            const view = request.view;
            unitController.getUnitById(unitId, view, unit => (
                request.isAdministrator === true || unit.companyId === request.companyId
            ));
        });

        // edit unit route
        expressApp.post('/api/v1/unit/:id', requireUserWithCompanyAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;

            try {
                let unitId = request.params.id;
                if (isNaN(unitId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'id'});
                unitId = parseInt(unitId);

                let unit = request.body.unit;
                if (unit === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', {parameter: 'unit'});
                if (typeof (unit) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'unit'});

                if (unit.id !== unitId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', {object: 'unit', id: 'id'});

                if (unit.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');

                await unitController.editUnit(unit, view, unit => (
                    request.isAdministrator === true || unit.companyId === request.companyId
                ));
            }
            catch (error) {
                view.error(error);
            }
        });

        // delete unit route
        expressApp.delete('/api/v1/unit/:id/delete', requireUserWithCompanyAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;
            try {
                let unitId = request.params.id;
                if (isNaN(unitId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'id'});
                unitId = parseInt(unitId);

                await unitController.deleteUnitById(unitId, view, unit => (
                    request.isAdministrator === true || unit.companyId === request.companyId
                ));
            }
            catch (error) {
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
        if (!UnitRoutesSingleton.#instance)
            UnitRoutesSingleton.#instance = new UnitRoutes();
        return UnitRoutesSingleton.#instance;
    }
}

export default UnitRoutesSingleton;
