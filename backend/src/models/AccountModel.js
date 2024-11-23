'use strict';

import ModelSingleton from '../model.js';

class AccountModel {
    #userModel = null;
    #authModel = null;

    initialize (_) {
        const model  = ModelSingleton.getInstance();
        this.#userModel = model.getUserModel();
        this.#authModel = model.getAuthModel();
    }

    async getUserProfile(userId) {
        return await this.#userModel.getUserById(userId);
    }

    generateRandomAuthCode() {
        return this.#authModel.generateRandomAuthCode();
    }

    async checkPassword(userId, password) {
        return await this.#userModel.checkPassword(userId, password);
    }

    async changePassword(userId, password) {
        return await this.#userModel.editUser({ id: userId, password });
    }

    sendChangeEmailAuthCode(authCode, originalEmail, newEmail, translation) {
        return this.#authModel.sendChangeEmailAuthCode(authCode, originalEmail, newEmail, translation);
    }

    async prepareEmailChange(userId, email, authCode, invalidateCodeImmediately) {
        return await this.#authModel.prepareEmailChange(userId, email, authCode, invalidateCodeImmediately);
    }

    async prepareAccountDeletion(userId, authCode, invalidateCodeImmediately) {
        return await this.#authModel.prepareAccountDeletion(userId, authCode, invalidateCodeImmediately);
    }

    sendAccountDeletionAuthCode(authCode, email, translation) {
        return this.#authModel.sendAccountDeletionAuthCode(authCode, email, translation);
    }

    async prepareAccountUnlock(userId, authCode) {
        return await this.#authModel.prepareAccountUnlock(userId, authCode);
    }

    async sendUnlockAccountAuthCode(authCode, email, translation) {
        return this.#authModel.sendUnlockAccountAuthCode(authCode, email, translation);
    }


}


class AccountModelSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AccountModelSingleton!');
    }

    static getInstance() {
        if (! AccountModelSingleton.#instance)
            AccountModelSingleton.#instance = new AccountModel();
        return AccountModelSingleton.#instance;
    }
}

export default AccountModelSingleton;
