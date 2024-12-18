import assert from 'assert';

import {ComaintApiErrorInvalidRequest} from '../../../common/src/error.mjs';

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
    if (properties !== null && !(properties instanceof Array)) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'properties'}));
        return;
    }
    request.requestProperties = properties;
    next();
};

export default requestPropertiesMiddleware;
