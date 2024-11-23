'use strict';
import dotenv from 'dotenv';
import promise_mysql from 'promise-mysql';

import ComaintBackendApi from '../src/ComaintBackendApi.js';

dotenv.config({ path: './test/.env' });

let api = null;
let accountData = null;
let accessToken = null;
let refreshToken = null;

let db = null;
let dbHost;
let dbPort;
let dbDatabase;
let dbUser;
let dbPassword;
let context = null;

const contextInfoCallback = (updatedContext) => {
    context = {... updatedContext};
};

const accountSerializeCallback = (jsonData) => {
    if (jsonData === undefined) {
        jsonData = JSON.parse(accountData);
    }
    else {
        accountData = JSON.stringify(jsonData);
        accessToken = jsonData.accessToken;
        refreshToken = jsonData.refreshToken;
    }
    return jsonData;
};

const initializeApi = () => {
    const backendUrl = process.env.BACKEND_URL;
    if (! backendUrl)
        throw new Error('Env variable «BACKEND_URL» is not defined');
    api = new ComaintBackendApi(backendUrl, accountSerializeCallback, contextInfoCallback);
    context = null;
};

const terminateApi = () => {
    api = null;
    context = null;
    accountData = null;
};

const connectDb = async () => {
    dbHost = process.env.DB_HOST || 'localhost';
    dbPort = process.env.DB_PORT || 3306;
    dbDatabase = process.env.DB_DATABASE || 'db_comaint';
    dbUser = process.env.DB_USER || 'comaint';
    dbPassword = process.env.DB_PASSWORD;

    if (dbPassword === undefined)
        throw new Error(`Parameter «DB_PASSWORD» not found in «${CONF_FILE}»`);

    db = await promise_mysql.createConnection({
        host: dbHost,
        port: dbPort,
        database: dbDatabase,
        user: dbUser,
        password: dbPassword
    });
    if (db.code)
        throw new Error(`Can't connect database`);
};

const disconnectDb = async () => {
    if (db === null)
        return;
    db.end();
    db = null;
};

const requestDb = async (sqlQuery, sqlValues = []) => {
    if (db === null)
        await connectDb();
    const result = await db.query(sqlQuery, sqlValues);
    if (result.code)
        throw new Error(`SQL error : ${result.code}`);
    return result;
};

export {
    api,
    initializeApi,
    terminateApi,
    connectDb,
    disconnectDb,
    requestDb,
    context,
    accessToken,
    refreshToken
};
