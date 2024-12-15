
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';


class GlobalController {
    static #instance = null;

    #model = null;

    constructor() {
        if (GlobalController.#instance !== null)
            throw new Error("Can not instanciate GlobalController. Use GlobalController.getInstance()");
    }

    static getInstance() {
        if (! GlobalController.#instance)
            GlobalController.#instance = new GlobalController();
        return GlobalController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
    }

    async checkDatabase(view) {
        assert(view !== undefined);
        let success = false;
        let message = null;
        try {
            await this.#model.checkAccess();
            success = true;
            message = 'Success';
        }
        catch (error) {
            message = error.message;
        }
        view.json({ success, message });
    }
}

export default GlobalController;
