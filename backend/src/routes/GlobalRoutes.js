'use strict';
import assert from 'assert'

import GlobalController from '../controllers/GlobalController.js';
import View from '../view.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

import { controlObject } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class GlobalRoutes {

    initialize(expressApp, config, apiVersion) {
        const globalController = GlobalController.getInstance();

        // special API routes to check i18n support
        expressApp.get(`/api/welcome`, (request, response) => {
            const view = new View(request, response);
            view.json({
                response: view.translation('general.welcome')
            });
        });

        expressApp.post(`/api/welcome`, (request, response) => {
            const view = new View(request, response);
            try {
                const firstname = request.body.firstname;
                if (firstname === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'firstname'});
                if (typeof(firstname) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'firstname'});
                const lastname = request.body.lastname;
                view.json({
                    response: view.translation('general.hello', { firstname, lastname })
                });
            }
            catch(error) {
                view.error(error);
            }
        });


        expressApp.get(`/api/version`, (request, response) => {
            const view = new View(request, response);
            view.json({ version: apiVersion });
        });

        expressApp.get(`/api/${apiVersion}/backend-version`, (request, response) => {
            const view = new View(request, response);
            view.json({ version: config.version});
        });

        expressApp.post(`/api/${apiVersion}/check-database`, async (request, response) => {
            const view = new View(request, response);
            await globalController.checkDatabase(view);
        });
    }
}

class GlobalRoutesSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate GlobalRoutesSingleton!');
    }

    static getInstance() {
        if (! GlobalRoutesSingleton.#instance)
            GlobalRoutesSingleton.#instance = new GlobalRoutes();
        return GlobalRoutesSingleton.#instance;
    }
}


export default GlobalRoutesSingleton; 
