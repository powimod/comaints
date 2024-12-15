import assert from 'assert';

import {ComaintApiErrorUnauthorized} from '../../../common/src/error.mjs';

const requireUserWithCompanyAuthMiddleware = (request, _, next) => {
    const view = request.view;
    assert(view !== undefined);
    const userId = request.userId;
    const connected = request.userConnected;
    assert(userId !== undefined);
    assert(connected !== undefined);
    console.log(`require user auth, userId:${userId}, connected:${connected}`);
    if (userId === null || connected !== true) {
        view.error(new ComaintApiErrorUnauthorized(view.translation('error.unauthorized_access')));
        return;
    }
    if (userId.companyId === null) {
        view.error(new ComaintApiErrorUnauthorized(view.translation('error.company_not_initialized')));
        return;
    }
    next();
};

export default requireUserWithCompanyAuthMiddleware;
