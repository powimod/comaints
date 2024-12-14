'use strict';

import ModelSingleton from '../models/model.js';
import View from '../view.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

/*
import AuthControllerSingleton    from './AuthController.js';
import AccountControllerSingleton from './AccountController.js';
import CompanyControllerSingleton from './CompanyController.js';
import AdminControllerSingleton   from './AdminController.js';
import UserControllerSingleton    from './UserController.js';
import TokenControllerSingleton   from './TokenController.js';
*/
import UnitController    from './UnitController.js';

const API_VERSION = 'v1';

class ControllerManager {
    static #instance = null

	#authController = null;
	#accountController = null;
	#adminController = null;
	#companyController = null;
	#userController = null;
	#tokenController = null;
	#unitController = null;

    constructor() {
        if (ControllerManager.#instance !== null)
            throw new Error("Can not instanciate ControllerManager. Use ControllerManager.getInstance()");
    }

    static getInstance() {
        if (ControllerManager.#instance === null)
            ControllerManager.#instance = new ControllerManager();
        return ControllerManager.#instance;
    }

    async initializeControllers(config, expressApp) {

    }

    async initialize(config, expressApp) {

	    const model  = ModelSingleton.getInstance();

    /*
        // IMPORTANT :authController must be initialized first because it has a middleware to handle session cookies
        this.#authController = AuthControllerSingleton.getInstance();
        this.#authController.initialize(expressApp);

        this.#accountController = AccountControllerSingleton.getInstance();
        this.#accountController.initialize(expressApp);

        this.#companyController = CompanyControllerSingleton.getInstance();
        this.#companyController.initialize(expressApp);

        this.#adminController = AdminControllerSingleton.getInstance();
        this.#adminController.initialize(expressApp);

        this.#userController = UserControllerSingleton.getInstance();
        this.#userController.initialize(expressApp);

        this.#tokenController = TokenControllerSingleton.getInstance();
        this.#tokenController.initialize(expressApp);

*/
        this.#unitController = UnitController.getInstance();
        this.#unitController.initialize(expressApp);

    }

}

export default ControllerManager;