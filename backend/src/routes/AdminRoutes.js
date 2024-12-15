

import assert from 'assert';

import AdminController from '../controllers/AdminController.js';
import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';
import View from '../view.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs';
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class AdminRoutes {

    initialize(expressApp) {
        const adminController = AdminController.getInstance();

        expressApp.get('/api/v1/admin/check-access', requireAdminAuthMiddleware, async (request, response) => {
            const view = request.view;
            await adminController.checkAccess(view);
        });
    }
}

class AdminRoutesSingleton {
    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AdminRoutesSingleton!');
    }

    static getInstance() {
        if (! AdminRoutesSingleton.#instance)
            AdminRoutesSingleton.#instance = new AdminRoutes();
        return AdminRoutesSingleton.#instance;
    }
}

export default AdminRoutesSingleton;
