
import assert from 'assert';

import UserController from '../controllers/UserController.js';
import {ComaintApiErrorInvalidRequest} from '../../../common/src/error.mjs';

import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';
import requestPaginationMiddleware from '../middlewares/requestPaginationMiddleware.js';
import requestPropertiesMiddleware from '../middlewares/requestPropertiesMiddleware.js';

//import { controlObject } from '../../../common/src/objects/object-util.mjs';
//import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class UserRoutes {

    initialize(expressApp) {
        const userController = UserController.getInstance();

        expressApp.get('/api/v1/user/list', requireAdminAuthMiddleware, requestPropertiesMiddleware, requestPaginationMiddleware, async (request, _) => {
            const view = request.view;
            const properties = request.requestProperties;
            assert(properties !== undefined);
            const pagination = request.requestPagination;
            assert(pagination !== undefined);

            // for non admin users, add a filter on user company
            const filters = {};
            if (request.companyId !== null)
                filters.companyId = request.companyId;

            await userController.findUserList(properties, filters, pagination, view);
        });


        // user create route
        expressApp.post('/api/v1/user', requireAdminAuthMiddleware, async (request, _) => {
            const view = request.view;
            try {
                if (request.isAdministrator === false && request.companyId === null)
                    throw new ComaintApiErrorUnauthorized('error.user_not_logged_in');

                let user = request.body.user;
                if (user === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', {parameter: 'user'});
                if (typeof (user) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'user'});

                await userController.createUser(user, view);
            }
            catch (error) {
                view.error(error);
            }
        });

        // get user by ID route
        expressApp.get('/api/v1/user/:id', requireAdminAuthMiddleware, async (request) => {
            const userId = request.params.id;
            assert(request.userId);
            const view = request.view;
            userController.getUserById(userId, view);
        });

        // edit user route
        expressApp.post('/api/v1/user/:id', requireAdminAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;

            try {
                let userId = request.params.id;
                if (isNaN(userId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'id'});
                userId = parseInt(userId);

                let user = request.body.user;
                if (user === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', {parameter: 'user'});
                if (typeof (user) !== 'object')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'user'});

                if (user.id !== userId)
                    throw new ComaintApiErrorInvalidRequest('error.invalid_object_id', {object: 'user', id: 'id'});

                if (user.companyId !== request.companyId)
                    throw new ComaintApiErrorUnauthorized('error.not_owner');

                await userController.editUser(user, view, user => (
                    request.isAdministrator === true || user.companyId === request.companyId
                ));
            }
            catch (error) {
                view.error(error);
            }
        });

        // delete user route
        expressApp.delete('/api/v1/user/:id/delete', requireAdminAuthMiddleware, async (request) => {
            assert(request.userId);
            assert(request.companyId);
            const view = request.view;
            try {
                let userId = request.params.id;
                if (isNaN(userId))
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'id'});
                userId = parseInt(userId);

                await userController.deleteUserById(userId, view, user => (
                    request.isAdministrator === true || user.companyId === request.companyId
                ));
            }
            catch (error) {
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
        if (!UserRoutesSingleton.#instance)
            UserRoutesSingleton.#instance = new UserRoutes();
        return UserRoutesSingleton.#instance;
    }
}

export default UserRoutesSingleton; 
