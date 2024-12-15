import AdminController from '../controllers/AdminController.js';
import requireAdminAuthMiddleware from '../middlewares/requireAdminAuthMiddleware.js';

class AdminRoutes {

    initialize(expressApp) {
        const adminController = AdminController.getInstance();

        expressApp.get('/api/v1/admin/check-access', requireAdminAuthMiddleware, async (request, _) => {
            const view = request.view;
            await adminController.checkAccess(view);
        });
    }
}

class AdminRoutesSingleton {
    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate AdminRoutesSingleton!');
    }

    static getInstance() {
        if (!AdminRoutesSingleton.#instance)
            AdminRoutesSingleton.#instance = new AdminRoutes();
        return AdminRoutesSingleton.#instance;
    }
}

export default AdminRoutesSingleton;
