'use strict';

import ModelSingleton from '../models/model.js';
import View from '../view.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

//import AuthController    from './AuthController.js';
//import AccountController from './AccountController.js';
//import AdminController   from './AdminController.js';
import UserController    from './UserController.js';
//FIXME not used : import TokenController   from './TokenController.js';
import CompanyController from './CompanyController.js';
import UnitController    from './UnitController.js';
import GlobalController  from './GlobalController.js';

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
    #globalController = null;

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

        // IMPORTANT :authController must be initialized first because it has a middleware to handle session cookies
//        this.#authController = AuthController.getInstance();
//        this.#authController.initialize(expressApp);

//        this.#accountController = AccountController.getInstance();
//        this.#accountController.initialize(expressApp);

        this.#companyController = CompanyController.getInstance();
        this.#companyController.initialize(expressApp);

//        this.#adminController = AdminController.getInstance();
//        this.#adminController.initialize(expressApp);

        this.#userController = UserController.getInstance();
        this.#userController.initialize(expressApp);

// FIXME not used
//        this.#tokenController = TokenController.getInstance();
//        this.#tokenController.initialize(expressApp);

        this.#unitController = UnitController.getInstance();
        this.#unitController.initialize(expressApp);

        this.#globalController = GlobalController.getInstance();
        this.#globalController.initialize(expressApp);
    }

}

export default ControllerManager;
