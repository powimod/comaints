

import assert from 'assert';

import AccountController from '../controllers/AccountController.js';
import View from '../view.js';
import requireUserAuthMiddleware from '../middlewares/requireUserAuthMiddleware.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized, ComaintApiError } from '../../../common/src/error.mjs';
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class AccountRoutes {

    initialize(expressApp) {
        const accountController = AccountController.getInstance();

        expressApp.get('/api/v1/account/profile', requireUserAuthMiddleware, async (request, response) => {
            const view = request.view;
            const userId = request.userId;
            assert(userId !== null);
            await accountController.getProfile(userId, view);
        });

        expressApp.post('/api/v1/account/change-password', requireUserAuthMiddleware, async (request, response) => {
            const view = request.view;
            try {
                const userId = request.userId;
                assert(userId !== null);

                let currentPassword = request.body.currentPassword;
                if (currentPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'currentPassword'});
                if (typeof(currentPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'currentPassword'});

                let newPassword = request.body.newPassword;
                if (newPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'newPassword'});
                if (typeof(newPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'newPassword'});

                await accountController.changePassword(userId, currentPassword, newPassword, view);
            }
            catch(error) {
                view.error(error);
            }
        });


        expressApp.post('/api/v1/account/change-email', requireUserAuthMiddleware, async (request, response) => {
            const view = request.view;
            try {
                const userId = request.userId;
                assert(userId !== null);

                let newEmail = request.body.email;
                if (newEmail === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'email'});
                if (typeof(newEmail) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'newEmail'});

                let currentPassword = request.body.password;
                if (currentPassword === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'password'});
                if (typeof(currentPassword) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'password'});

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true;

                const invalidateCodeImmediately = (request.body.invalidateCodeImmediately !== undefined) ?
                    request.body.invalidateCodeImmediately : false;

                const options = {
                    sendCodeByEmail,
                    invalidateCodeImmediately 
                };

                await accountController.changeEmail(userId, newEmail, currentPassword, options, view);
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/account/delete', requireUserAuthMiddleware, async (request, _) => {
            const view = request.view;
            try {
                const userId = request.userId;
                assert(userId !== null);

                let confirmation = request.body.confirmation;
                if (confirmation === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', { parameter: 'confirmation'});
                if (typeof(confirmation) !== 'boolean')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'confirmation'});

                const invalidateCodeImmediately = (request.body.invalidateCodeImmediately !== undefined) ?
                    request.body.invalidateCodeImmediately : false;

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true;

                const options = {
                    invalidateCodeImmediately,
                    sendCodeByEmail 
                };

                await accountController.deleteAccount(userId, options, view);
            }
            catch(error) {
                view.error(error);
            }
        });

        expressApp.post('/api/v1/account/unlock', requireUserAuthMiddleware, async (request, _) => {
            const view = request.view;
            try {
                const userId = request.userId;
                assert(userId !== null);

                // self-test does not send validation code by email
                const sendCodeByEmail = (request.body.sendCodeByEmail !== undefined) ?
                    request.body.sendCodeByEmail : true;

                const options = {
                    sendCodeByEmail 
                };

                await accountController.unlockAccount(userId, options, view);
            }
            catch(error) {
                view.error(error);
            }
        });

    }
}

class AccountRoutesSingleton {
    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AccountRoutesSingleton!');
    }

    static getInstance() {
        if (! AccountRoutesSingleton.#instance)
            AccountRoutesSingleton.#instance = new AccountRoutes();
        return AccountRoutesSingleton.#instance;
    }
}

export default AccountRoutesSingleton;
