
import GlobalController from '../controllers/GlobalController.js';
import View from '../view.js';
import {ComaintApiErrorInvalidRequest} from '../../../common/src/error.mjs';

//import { controlObject } from '../../../common/src/objects/object-util.mjs';
//import userObjectDef from '../../../common/src/objects/user-object-def.mjs';

class GlobalRoutes {

    initialize(expressApp, config, apiVersion) {
        const globalController = GlobalController.getInstance();

        /**
         * @openapi
         * /api/welcome:
         *   get:
         *     summary: Affiche un message de bienvenue
         *     responses:
         *       200:
         *         description: "Une réponse JSON contenant le message."
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   description: "Le message de bienvenue"
         *             example:
         *               message: "Bienvenue"
         */
        expressApp.get(`/api/welcome`, (request, response) => {
            const view = new View(request, response);
            view.json({
                response: view.translation('general.welcome')
            });
        });


        /**
         * @openapi
         * /api/welcome:
         *   post:
         *     summary: "Renvoie un message de bienvenue contenant le nom et le prénom envoyés"
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               firstname:
         *                 type: string
         *                 description: "Le prénom de l'utilisateur."
         *                 example: "Jean"
         *               lastname:
         *                 type: string
         *                 description: "Le nom de famille de l'utilisateur."
         *                 example: "Dupont"
         *     responses:
         *       200:
         *         description: "Un message de bienvenue personnalisé au format JSON."
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 message:
         *                   type: string
         *                   description: "Message personnalisé de bienvenue."
         *                   example: "Bienvenue Jean Dupont"
         */

        expressApp.post(`/api/welcome`, (request, response) => {
            const view = new View(request, response);
            try {
                const firstname = request.body.firstname;
                if (firstname === undefined)
                    throw new ComaintApiErrorInvalidRequest('error.request_param_not_found', {parameter: 'firstname'});
                if (typeof (firstname) !== 'string')
                    throw new ComaintApiErrorInvalidRequest('error.request_param_invalid', {parameter: 'firstname'});
                const lastname = request.body.lastname;
                view.json({
                    response: view.translation('general.hello', {firstname, lastname})
                });
            }
            catch (error) {
                view.error(error);
            }
        });

        /**
         * @openapi
         * /api/version:
         *   get:
         *     summary: Affiche la version de l'API
         *     responses:
         *       200:
         *         description: "Une réponse JSON contenant la version de l'API."
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 version:
         *                   type: string
         *                   description: "La version de l'API"
         *             example:
         *               message: "v1"
         */
        expressApp.get(`/api/version`, (request, response) => {
            const view = new View(request, response);
            view.json({version: apiVersion});
        });

        /**
         * @openapi
         * /api/v1/backend-version:
         *   get:
         *     summary: Affiche la version du backend
         *     responses:
         *       200:
         *         description: "Une réponse JSON contenant la version du backend."
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 version:
         *                   type: string
         *                   description: "La version du backend"
         *             example:
         *               message: "0.0.1"
         */
        expressApp.get(`/api/${apiVersion}/backend-version`, (request, response) => {
            const view = new View(request, response);
            view.json({version: config.version});
        });

        /**
         * @openapi
         * /api/v1/check-database:
         *   post:
         *     summary: Test l'accès à la base de données
         *     responses:
         *       200:
         *         description: "Une réponse JSON indiquant que la connexion a réussi."
         *         content:
         *           application/json:
         *             schema:
         *               type: object
         *               properties:
         *                 success:
         *                   type: boolean 
         *                   description: "Systématiquement à true"
         *                 message:
         *                   type: string 
         *                   description: "Contient success"
         *             example:
         *               success: true
         *               message: "Success"
         */
        expressApp.post(`/api/${apiVersion}/check-database`, async (request, response) => {
            const view = new View(request, response);
            await globalController.checkDatabase(view);
        });
    }
}

class GlobalRoutesSingleton {

    static #instance = null;

    constructor() {
        throw new Error('Can not instanciate GlobalRoutesSingleton!');
    }

    static getInstance() {
        if (!GlobalRoutesSingleton.#instance)
            GlobalRoutesSingleton.#instance = new GlobalRoutes();
        return GlobalRoutesSingleton.#instance;
    }
}


export default GlobalRoutesSingleton; 
