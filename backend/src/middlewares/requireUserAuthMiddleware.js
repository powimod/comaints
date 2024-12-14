import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';

const requireUserAuthMiddleware = (request, _ , next) => {
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
    next();
};

export default requireUserAuthMiddleware;
