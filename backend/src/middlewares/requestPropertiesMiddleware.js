import assert from 'assert';

import ModelSingleton from '../model.js';
import { ComaintApiErrorInvalidRequest, ComaintApiErrorUnauthorized } from '../../../common/src/error.mjs';

const requestPropertiesMiddleware = (request, _, next) => {
    const view = request.view;
    assert(view !== undefined);
    let properties = null;
    if (request.method === 'GET') {
        const stringValue = request.query?.properties || null;
        if (stringValue !== null) 
            properties = stringValue.split(',');
    }
    else {
        properties = request.body.properties || null;
    }
    if (properties !== null && ! (properties instanceof Array)) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', { parameter: 'properties'}));
        return;
    }
    request.requestProperties = properties;
console.log("dOm ==================================== requestPropertiesMiddleware : ", request.requestProperties)
    next();
};

export default requestPropertiesMiddleware;
