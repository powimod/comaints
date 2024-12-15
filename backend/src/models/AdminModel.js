

import assert from 'assert';
import ModelSingleton from './model.js';

import { ComaintApiError } from '../../../common/src/error.mjs';
import { AccountState } from '../../../common/src/global.mjs';
import MailManagerSingleton from '../MailManager.js';

class AdminModel {
    #db = null;
    #userModel = null;

    initialize (db, securityConfig) {
        assert(db !== undefined);
        assert(securityConfig !== undefined);
        this.#db = db;
        const model  = ModelSingleton.getInstance();
    }
}


class AdminModelSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AdminModelSingleton!');
    }

    static getInstance() {
        if (! AdminModelSingleton.#instance)
            AdminModelSingleton.#instance = new AuthModel();
        return AdminModelSingleton.#instance;
    }
}

export default AdminModelSingleton;
