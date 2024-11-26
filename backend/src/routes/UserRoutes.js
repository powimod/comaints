'use strict';
import assert from 'assert'

import ModelSingleton from '../model.js';
import { requireUserWithCompanyAuth, requestPagination, requestFilters, requestProperties } from './middleware.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

import { controlObject } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class UserRoutes {

    initialize(expressApp) {
        const model  = ModelSingleton.getInstance();
        
        const userModel = model.getUserModel();

        expressApp.get('/api/v1/user/list', requireUserWithCompanyAuth, requestProperties, requestPagination, async (request, _) => {
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
                const result = await userModel.findUserList(properties, filters, pagination);
                view.json(result);
            }
            catch(error) {
                view.error(error);
            }
        });


        // TODO ajouter withAuth
        expressApp.post('/api/v1/user', requireUserWithCompanyAuth, async (request, _) => {
            const view = request.view;
            try {
                if (request.isAdministrator === false && request.companyId === null)
                    throw new ComaintApiErrorUnauthorized('error.user_not_logged_in');

                let user = request.body.user;
                if (user === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'user'});
                if (typeof(user) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'user'});
                const [ errorMsg, errorParam ] = controlObject(userObjectDef, user, { fullCheck:true, checkId:false });
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

                // for non admin users, force user company ID
                if (request.companyId !== null)
                    unit.companyId = request.companyId

                // delete protected properties
                delete user.companyId;
                delete user.password;
                delete user.state;
                delete user.lastUse;
                delete user.authAction;
                delete user.authData;
                delete user.authCode;
                delete user.authExpiration;
                delete user.authAttempts;

                user = await userModel.createUser(user);
                view.json(user);
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.get('/api/v1/user/:id', requireUserWithCompanyAuth, async (request) => {
            const userId = request.params.id;
            const view = request.view;
            try {
                assert(request.userId);
                let user = await userModel.getUserById(userId);

                // silently ignore tentative to access not owned user
                if (user !== null && request.isAdministrator === false && user.companyId !== request.companyId)
                    user = null;
                view.json({user});
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/user/:id', requireUserWithCompanyAuth, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;

            try {
                let userId = request.params.id;
                if (isNaN(userId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'id'});
                userId = parseInt(userId);

                let user = request.body.user;
                if (user === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'user'});
                if (typeof(user) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'user'});

                if (user.id !== userId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', { object: 'user', id: 'id'});

                if (user.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');

                const [ errorMsg, errorParam ] = controlObject(userObjectDef, user, { fullCheck:true, checkId:false });
                if (errorMsg)
                    throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

                user = await userModel.editUser(user);
                view.json({user});
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.delete('/api/v1/user/:id/delete', requireUserWithCompanyAuth, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;
            try {
                let userId = request.params.id;
                if (isNaN(userId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'id'});
                userId = parseInt(userId);

                let user = await userModel.getUserById(userId);
                if (user === null)
                    throw new ComaintApiErrorUnauthorized('error.not_found');

                if (user.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');
                user = null;

                const deleted = await userModel.deleteUserById(userId);
                view.json({deleted});
            }
            catch(error) {
                view.error(error);
            }
        });
    }

}

class UserRoutesSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate UserRoutesSingleton!');
    }

    static getInstance() {
        if (! UserRoutesSingleton.#instance)
            UserRoutesSingleton.#instance = new UserRoutes();
        return UserRoutesSingleton.#instance;
    }
}

export default UserRoutesSingleton; 
