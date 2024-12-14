'use strict';

import assert from 'assert';

import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';
import View from '../view.js';
import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs';
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class AdminRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance();

        const userModel = model.getUserModel();

        expressApp.get('/api/v1/admin/check-access', requireAdminAuthMiddleware, async (request, response) => {
            const view = request.view;
            try {
                view.json({ message: "This is an administrator account"});
            }
            catch(error) {
                view.error(error);
            }
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
