'use strict';
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObjectProperty } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';
import { AccountState } from '../../../common/src/global.mjs';

class AuthController {
    static #instance = null

    #model = null;
    #authModel = null;

    constructor() {
        if (AuthController.#instance !== null)
            throw new Error("Can not instanciate AuthController. Use AuthController.getInstance()");
    }

    static getInstance() {
        if (! AuthController.#instance)
            AuthController.#instance = new AuthController();
        return AuthController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#authModel = this.#model.getAuthModel();
    }


    async register(email, password, options, view) {
        try {
            const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email);
            if (errorMsg1)
                throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1);

            const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', password);
            if (errorMsg2)
                throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2);

            const authCode = this.#authModel.generateRandomAuthCode();

            let userId = null;
            let companyId = null;
            let administrator = null;
            let registeredAccount = false;

            // Si le compte existe déjà pour cet email alors on va tester si le compte est en cours
            // d'enregistrement ou s'il est opérationnel.
            // S'il est déjà opérationnel, on envoie un mail à l'utilisateur pour l'informer d'une tentative de
            // création d'un compte avec son email et on ne signale pas que le compte est déjà utilisé
            // car ça donne des informations à un pirate que le compte existe.
            // Si le compte existe déjà mais qu'il est en cours d'enregistrement, on va juste générer
            // un nouveau code d'authentification.
            let profile = await this.#authModel.getUserProfileByEmail(email);
            if (profile !== null) {
                if (profile.state !== AccountState.PENDING) {
                    // if user is fully registered, send him an information message
                    if (options.sendCodeByEmail)
                        await this.#authModel.sendExistingEmailAlertMessage(email, view.translation);
                    registeredAccount = true;
                }
                userId = profile.id;
                companyId = profile.companyId;
                administrator = profile.administrator;
            }

            // if account does not exist or is not fully registered
            if (registeredAccount === false) {
                const result = await this.#authModel.register(email, password, authCode, options.invalidateCodeImmediately);

                const user = result.user;
                assert(user !== undefined);
                userId = user.id;
                companyId = user.companyId;
                assert(userId !== undefined);
                assert (companyId === null); // companyId should be null
                assert (user.administrator !== undefined);
                administrator = user.administrator;

                if (options.sendCodeByEmail)
                    await this.#authModel.sendRegisterAuthCode(authCode, email, view.translation);
            }

            assert (administrator !== null);

            // generate new tokens with userConnected = false
            const [ newRefreshToken, newRefreshTokenId ] = await this.#authModel.generateRefreshToken(userId, companyId, false);
            const newAccessToken  = await this.#authModel.generateAccessToken(userId, companyId, administrator, newRefreshTokenId, false);

            view.json({
                message: 'User registration done, waiting for validation code',
                'refresh-token': newRefreshToken,
                'access-token': newAccessToken
            });
        }
        catch(error) {
            view.error(error);
        }
    }

    async validateCode(userId, code, view) {
        try {
            const [ errorMsg, errorParam ] = controlObjectProperty(userObjectDef, 'authCode', code);
            if (errorMsg)
                throw new ComaintApiErrorInvalidRequest(errorMsg, errorParam);

            const isAuthCodeValid = await this.#authModel.checkAuthCode(userId, code);

            if (isAuthCodeValid) {
                let user = await this.#authModel.processAuthOperation(userId);
                if (user === null) {
                    // with delete account route, user is set to null
                    view.storeRenewedTokens(null, null);
                    view.storeRenewedContext({
                        email: null,
                        connected: false,
                        administrator: false,
                        company: false
                    });
                }
                else {
                    // TODO delete previous refresh token stored in request.refreshTokenId ?
                    // generate a new access token with userConnected = true
                    const [ newRefreshToken, newRefreshTokenId ] = await this.#authModel.generateRefreshToken(user.id, user.companyId, true);
                    const newAccessToken  = await this.#authModel.generateAccessToken(user.id, user.companyId, user.administrator, newRefreshTokenId, true);
                    view.storeRenewedTokens(newAccessToken, newRefreshToken);
                    view.storeRenewedContext({
                        email: user.email,
                        connected: true,
                        administrator: user.administrator,
                        company: user.companyId !== null
                    });
                }
            }
            view.json({ validated: isAuthCodeValid });
        }
        catch(error) {
            view.error(error);
        }
    }

    async resendCode(userId, options, view) {
        try {
            let profile = null;
            // try to get IDs from access token
            if (userId !== null) {
                profile = await this.#authModel.getUserProfileById(userId);
            }
            else {
                // if access token was not found try to use an email in request body (used to reset password)
                const email = request.body.email;
                if (email === undefined)
                    throw new Error("Can't identify user by access-token or email"); // TODO use ComaintApiError
                if (typeof(email) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'email'});
                const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email);
                if (errorMsg1)
                    throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1);
                profile = await this.#authModel.getUserProfileByEmail(email);
            }

            if (profile === null)
                throw new Error('User not found'); // FIXME silently ignore error ?

            const authCode = this.#authModel.generateRandomAuthCode();
            if (options.sendCodeByEmail)
                await this.#authModel.sendRegisterAuthCode(authCode, profile.email, view.translation);
            await this.#authModel.changeAuthCode(profile.id, authCode);
            view.json({ message: "Code resent"});
        }
        catch(error) {
            view.error(error);
        }
    }

/* TODO
    async login(userId, options, view) {
        try {
        }
        catch(error) {
            view.error(error);
        }
    }
 
    async logout(userId, options, view) {
        try {
        }
        catch(error) {
            view.error(error);
        }
    }

    async refreshTokens(userId, options, view) {
        try {
        }
        catch(error) {
            view.error(error);
        }
    }
*/

    async resetPassword(email, newPassword, options, view) {
        try {
            const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', email);
            if (errorMsg1)
                throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1);

            const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', newPassword);
            if (errorMsg2)
                throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2);

            const authCode = this.#authModel.generateRandomAuthCode();
            if (options.sendCodeByEmail)
                await this.#authModel.sendResetPasswordAuthCode(authCode, email, view.translation);
            await this.#authModel.preparePasswordReset(email, newPassword, authCode, false);

            view.json({ message: 'Password changed, waiting for validation code' });
        }
        catch(error) {
            view.error(error);
        }
    }
 
}

export default AuthController;
