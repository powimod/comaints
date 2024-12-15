
import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';

class AdminController {
    static #instance = null;

    #model = null;
    #adminModel = null;

    constructor() {
        if (AdminController.#instance !== null)
            throw new Error("Can not instanciate AdminController. Use AdminController.getInstance()");
    }

    static getInstance() {
        if (! AdminController.#instance)
            AdminController.#instance = new AdminController();
        return AdminController.#instance;
    }

    initialize(config) {
        this.#model = ModelSingleton.getInstance();
        this.#adminModel = this.#model.getAdminModel();
    }

    async checkAccess(view) {
        view.json({ message: "This is an administrator account"});
    }
}

export default AdminController;
