import assert from 'assert';

import {ComaintApiErrorInvalidRequest} from '../../../common/src/error.mjs';

const requestFiltersMiddleware = (request, _, next) => {
    const view = request.view;
    assert(view !== undefined);
    const filters = request.body.filters || {};
    if (typeof (filters) !== 'object') {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'filters'}));
        return;
    }
    request.requestFilters = filters;
    next();
};

export default requestFiltersMiddleware;
