'use strict';

import ModelSingleton from '../models/model.js';
import View from '../view.js';
import { ComaintApiErrorInvalidRequest } from '../../../common/src/error.mjs';

import initializeViewMiddleware  from '../middlewares/initializeViewMiddleware.js';
import GlobalRoutesSingleton  from '../routes/GlobalRoutes.js';
import AuthRoutesSingleton    from '../routes/AuthRoutes.js';
import AccountRoutesSingleton from '../routes/AccountRoutes.js';
import CompanyRoutesSingleton from '../routes/CompanyRoutes.js';
import AdminRoutesSingleton   from '../routes/AdminRoutes.js';
import UserRoutesSingleton    from '../routes/UserRoutes.js';
// FIXME not used : import TokenRoutesSingleton   from '../routes/TokenRoutes.js';
import UnitRoutesSingleton    from '../routes/UnitRoutes.js';

const API_VERSION = 'v1';

class RouteManager {

    static #instance = null;

	#authRoutes = null;
	#accountRoutes = null;
	#adminRoutes = null;
	#companyRoutes = null;
	#userRoutes = null;
	//#tokenRoutes = null;
	#unitRoutes = null;
	#globalRoutes = null;

    constructor() {
        if (RouteManager.#instance !== null)
            throw new Error("Can not instanciate RouteManager. Use RouteManager.getInstance()");
    }

    static getInstance() {
        if (RouteManager.#instance === null)
            RouteManager.#instance = new RouteManager();
        return RouteManager.#instance;
    }

    async initializeRoutes(config, expressApp) {

        // Express middleware to initialize a View instance associated with the request
        expressApp.use(initializeViewMiddleware);

	    const model  = ModelSingleton.getInstance();

        // IMPORTANT :authRoutes must be initialized first because it declares a middleware to handle session cookies
        this.#authRoutes = AuthRoutesSingleton.getInstance();
        this.#authRoutes.initialize(expressApp);

        this.#accountRoutes = AccountRoutesSingleton.getInstance();
        this.#accountRoutes.initialize(expressApp);

        this.#companyRoutes = CompanyRoutesSingleton.getInstance();
        this.#companyRoutes.initialize(expressApp);

        this.#adminRoutes = AdminRoutesSingleton.getInstance();
        this.#adminRoutes.initialize(expressApp);

        this.#userRoutes = UserRoutesSingleton.getInstance();
        this.#userRoutes.initialize(expressApp);

// FIXME not used
//        this.#tokenRoutes = TokenRoutesSingleton.getInstance();
//        this.#tokenRoutes.initialize(expressApp);

        this.#unitRoutes = UnitRoutesSingleton.getInstance();
        this.#unitRoutes.initialize(expressApp);

        this.#globalRoutes = GlobalRoutesSingleton.getInstance();
        this.#globalRoutes.initialize(expressApp, config, API_VERSION);

    }
}

export default RouteManager;
