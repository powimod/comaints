
const BACKEND_VERSION = '0.0.1';

import express from 'express';
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';
import middleware from 'i18next-http-middleware';
import dotenv from 'dotenv';
import path from 'path';
import {fileURLToPath} from 'url';
import swaggerUi from 'swagger-ui-express';
import swaggerConfig from './swaggerConfig.js';

import MailManagerModel from './MailManager.js';

import RouteManager from './routes/RouteManager.js';
import ControllerManager from './controllers/ControllerManager.js';
import ModelSingleton from './models/model.js';

dotenv.config();

const main = async () => {

    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));

    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerConfig));
    //console.log(JSON.stringify(swaggerConfig.paths, null, 2));
    app.get('/swagger.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerConfig);
    });

    // i18n support
    i18next.use(Backend).use(middleware.LanguageDetector).init({
        fallbackLng: 'en',
        preload: ['en', 'fr'],
        ns: ['backend', 'common'],
        defaultNS: 'backend',
        backend: {
            loadPath: (lng, ns) => {
                if (ns === 'common')
                    return `../${ns}/locales/${lng}.json`;
                return `./locales/${lng}.json`;
            }
        },
        interpolation: {
            escapeValue: false // disable conversion &lt;
        }
    });
    app.use(middleware.handle(i18next));

    // serve common locale files
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    app.use('/locales/common', express.static(path.join(__dirname, '../../common/locales/')));

    // configuration is defined in «.env» file
    const env = process.env;
    const dbPassword = env.DB_PASSWORD;
    if (!dbPassword)
        throw new Error('DB_PASSWORD not defined');
    const tokenSecret = env.TOKEN_SECRET;
    if (!tokenSecret)
        throw new Error('TOKEN_SECRET not defined');

    const mailServerPassword = env.MAIL_SERVER_PASSWORD;
    if (!mailServerPassword)
        throw new Error('MAIL_SERVER_PASSWORD not defined');
    const mailServerFrom = env.MAIL_SERVER_FROM;
    if (!mailServerFrom)
        throw new Error('MAIL_SERVER_FROM not defined');

    const adminEmail = env.ADMIN_EMAIL || null;
    const adminPassword = env.ADMIN_PASSWORD || null;


    // FIXME env variable values are not checked
    let config = {
        version: BACKEND_VERSION,
        server: {
            port: process.env.PORT || 9101
        },
        database: {
            name: env.DB_NAME || 'comaint',
            host: env.DB_HOST || 'localhost',
            port: env.DB_PORT || 3306, // MySQL default port
            user: env.DB_USER || 'admin',
            retry_interval: env.DB_RETRY_INTERVAL || 10, // seconds
            max_retries: env.DB_MAX_RETRIES || -1, // -1:infinity
            ping_interval: env.DB_PING_INTERVAL || 600, // 10 minutes 
            connection_limit: env.DB_CONNECTION_LIMIT || 10, // max number of connexion in pool
            password: dbPassword
        },
        security: {
            tokenSecret: tokenSecret,
            hashSalt: parseInt(env.HASH_SALT) || 10,
            refreshTokenLifespan: parseInt(env.REFRESH_TOKEN_LIFESPAN) || 365, // days
            accessTokenLifespan: parseInt(env.ACCESS_TOKEN_LIFESPAN) || 120, // seconds
            codeValidityPeriod: parseInt(env.CODE_VALIDITY_PERIOD) || 600, // seconds
            maxAuthAttempts: parseInt(env.MAX_AUTH_ATTEMPTS) || 5
        },
        admin: {
            email: adminEmail,
            password: adminPassword
        }
    };

    const mailConfig = {
        host: env.MAIL_SERVER_HOST || 'localhost',
        port: env.MAIL_SERVER_PORT || 25,
        user: env.MAIL_SERVER_USER || 'comaint',
        password: mailServerPassword,
        from: mailServerFrom,
        secure: env.MAIL_SECURE === 'true'
    };

    const mailManager = MailManagerModel.getInstance();
    mailManager.initialize(mailConfig);

    const model = ModelSingleton.getInstance();
    await model.initialize(config);

    const controllerManager = ControllerManager.getInstance();
    await controllerManager.initialize(config);

    const routeManager = RouteManager.getInstance();
    await routeManager.initializeRoutes(config, app);

    // catch signals to stop daemon
    const stopService = async () => {
        console.log('Stopping Comaint backend...');
        await model.terminate();
        process.exit(0);
    };
    process.on('SIGINT', stopService); // catch CTRL+C signal 
    process.on('SIGTERM', stopService); // catch CTRL+D signal (sent by SystemD)

    const port = config.server.port;

    // use a Promise to transmit connection error to the main caller
    await new Promise((resolve, reject) => {
        const server = app.listen(
            port,
            () => { // success
                console.log(`Comaint backend listening on ${port}...`);
                resolve(server);
            }
        );
        server.on('error', (error) => {
            reject(error);
        });
    });

};


main()
    .catch(error => {
        const message = error.message ? error.message : error;
        console.error(`ERROR : Can not start Comaint backend : ${message}`);
        process.exit(1);
    });
