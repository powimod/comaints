'use strict';
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';
import { controlObjectProperty, buildPublicObjectVersion } from '../../../common/src/objects/object-util.mjs';
import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class AccountController {
    static #instance = null

    #model = null;
    #accountModel = null;

    constructor() {
        if (AccountController.#instance !== null)
            throw new Error("Can not instanciate AccountController. Use AccountController.getInstance()");
    }

    static getInstance() {
        if (! AccountController.#instance)
            AccountController.#instance = new AccountController();
        return AccountController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#accountModel = this.#model.getAccountModel();
    }

    async getProfile(userId, view) {
        assert(userId !== undefined);
        assert(view !== undefined);
        try {
            let user = await this.#accountModel.getUserProfile(userId);
            user = buildPublicObjectVersion(userObjectDef, user);
            view.json({ profile:user });
        }
        catch(error) {
            view.error(error);
        }
    }


    async changePassword(userId, currentPassword, newPassword, view) {
        try {
            const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'password', currentPassword);
            if (errorMsg1)
                throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1);

            const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', newPassword);
            if (errorMsg2)
                throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2);

            const isCurrentPassordValid = await this.#accountModel.checkPassword(userId, currentPassword);
            if (! isCurrentPassordValid )
                throw new ComaintApiErrorUnauthorized('error.invalid_password');

            const user = await this.#accountModel.getUserProfile(userId);
            if (! user)
                throw new Error('User not found');
            await this.#accountModel.changePassword(userId, newPassword);

            // no special info to return (exception thrown when an error occures)
            view.json({message: 'Password changed'});
        }
        catch(error) {
            console.log(error);
            view.error(error);
        }
    }

    async changeEmail(userId, newEmail, currentPassword, options, view) {
        try {
            const [ errorMsg1, errorParam1 ] = controlObjectProperty(userObjectDef, 'email', newEmail);
            if (errorMsg1)
                throw new ComaintApiErrorInvalidRequest(errorMsg1, errorParam1);

            const [ errorMsg2, errorParam2 ] = controlObjectProperty(userObjectDef, 'password', currentPassword);
            if (errorMsg2)
                throw new ComaintApiErrorInvalidRequest(errorMsg2, errorParam2);

            let user = await this.#accountModel.getUserProfile(userId);
            if (! user)
                throw new Error('User not found');

            const isCurrentPassordValid = await this.#accountModel.checkPassword(userId, currentPassword);
            if (! isCurrentPassordValid )
                throw new ComaintApiErrorUnauthorized('error.invalid_password');


            // make a random validation code which will be sent by email to unlock account
            const authCode = this.#accountModel.generateRandomAuthCode();
            console.log(`Validation code is ${ authCode }`); // TODO remove this

            user = await this.#accountModel.prepareEmailChange(userId, newEmail, authCode, options.invalidateCodeImmediately);

            if (options.sendCodeByEmail)
                await this.#accountModel.sendChangeEmailAuthCode(authCode, user.email, newEmail, view.translation);

            view.json({message: 'Done, waiting for validation code'});
        }
        catch(error) {
            view.error(error);
        }
    }

    async deleteAccount(userId, options, view) {
        try {
            let user = await this.#accountModel.getUserProfile(userId);
            if (! user)
                throw new Error('User not found');

            // make a random validation code which will be sent by email to delete account
            const authCode = this.#accountModel.generateRandomAuthCode();
            console.log(`Validation code is ${ authCode }`); // TODO remove this

            user = await this.#accountModel.prepareAccountDeletion(userId, authCode, options.invalidateCodeImmediately);

            if (options.sendCodeByEmail)
                await this.#accountModel.sendAccountDeletionAuthCode(authCode, user.email, view.translation);

            view.json({ message: 'Done, waiting for validation code' });
        }
        catch(error) {
            view.error(error);
        }
    }
 
    async unlockAccount(userId, options, view) {
        try {
            let user = await accountModel.getUserProfile(userId);
            if (! user)
                throw new Error('User not found');

            // make a random validation code which will be sent by email to delete account
            const authCode = accountModel.generateRandomAuthCode();

            user = await accountModel.prepareAccountUnlock(userId, authCode);

            if (options.sendCodeByEmail)
                await accountModel.sendUnlockAccountAuthCode(authCode, user.email, view.translation);

            view.json({message: 'Done, waiting for validation code'});
        }
        catch(error) {
            view.error(error);
        }
    }
 
}

export default AccountController;
