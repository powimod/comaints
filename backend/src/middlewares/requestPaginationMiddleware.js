import assert from 'assert';

import {ComaintApiErrorInvalidRequest} from '../../../common/src/error.mjs';

const requestPaginationMiddleware = (request, _, next) => {
    const DEFAULT_PAGE = 1;
    const DEFAULT_LIMIT = 10;
    const view = request.view;
    assert(view !== undefined);
    let page, limit;
    if (request.method === 'GET') {
        page = parseInt(request.query?.page || DEFAULT_PAGE);
        limit = parseInt(request.query?.limit || DEFAULT_LIMIT);
    }
    else {
        page = request.body?.page || DEFAULT_PAGE;
        limit = request.body?.limit || DEFAULT_LIMIT;
    }
    if (isNaN(page) || page < 1) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'page'}));
        return;
    }
    if (isNaN(limit) || limit < 1) {
        view.error(new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'limit'}));
        return;
    }
    const offset = (page - 1) * limit;
    request.requestPagination = {page, limit, offset};
    next();
};

export default requestPaginationMiddleware;
