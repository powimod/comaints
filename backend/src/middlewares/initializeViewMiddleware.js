'use strict';
import View from '../view.js';

const initializeContextMiddleware = async (request, response, next) => {
    const view = new View(request, response);
    request.view = view;
    next();
}

export default initializeContextMiddleware;
