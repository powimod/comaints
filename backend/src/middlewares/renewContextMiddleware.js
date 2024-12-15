import assert from 'assert';

import ModelSingleton from '../models/model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';

const renewContextMiddleware = async (request, user) => {
    assert(request);
    assert(user);
    const view = request.view;

    const email = user ? user.email : null;
    const companyId = user ? user.companyId : null;
    const company = (companyId !== null);
    const administrator = user ? user.administrator : null;

    const connected = request.userConnected;
    assert(typeof(connected) === 'boolean');

    view.storeRenewedContext({
        email,
        connected,
        administrator,
        company
    });
};

export default renewContextMiddleware; 
