'use strict';

import mysql from 'promise-mysql';

import { sleep } from './util.js';
import CompanyModelSingleton  from './models/CompanyModel.js';
import UserModelSingleton     from './models/UserModel.js';
import AccountModelSingleton  from './models/AccountModel.js';
import TokenModelSingleton    from './models/TokenModel.js';
import AuthModelSingleton     from './models/AuthModel.js';
import UnitModelSingleton     from './models/UnitModel.js';
import { AccountState } from '../../common/src/global.mjs';

class Model {
    #dbPool = null;
    #authModel = null;
    #accountModel = null;
    #adminModel = null;
    #companyModel = null;
    #userModel = null;
    #tokenModel = null;
    #unitModel = null;

    async initialize(config) {

        // check «database» configuration section 
        const dbConfig = config.database;
        if (dbConfig === undefined)
            throw new Error(`Config «database» section not defined`);
        const dbParameterNames = [ 
            'name', 'host', 'port', 'user', 'password', 
            'retry_interval', 'max_retries', 'ping_interval'
        ];
        for (const parameterName of dbParameterNames ) {
            if (dbConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`);
        }

        // check «security» configuration section 
        if (config.security === undefined)
            throw new Error(`Config «security» section not defined`);

		// connection retry loop
		const retryInterval = dbConfig.retry_interval;
		let maxRetries = dbConfig.max_retries;
        if (maxRetries < 0)
            maxRetries = Infinity;

        // L'initialisation du pool ne tente pas directement une connexion à la base
        // les connexions réelles à la base se font lors des requêtes
		let dbPool =  await mysql.createPool({
            host: dbConfig.host,
            database: dbConfig.name,
            user: dbConfig.user,
            password: dbConfig.password,
            connectionLimit: dbConfig.connection_limit,
            reconnect: true // activated by default
        });

        let connection = false;
		for (let retry = 0; retry < maxRetries ; retry++){
			console.log(`Connecting database ...`);
			try {
                // execute a fake query to initialize database connection
                await dbPool.query('SELECT 1');
                connection = true;
                break;
			}
			catch (error) {
				console.log(`Database connection error : ${error.message}`);
			}
			console.log(`Connection retry n°${retry+1}/${maxRetries} : waiting ${retryInterval}s...`);
			await sleep(retryInterval * 1000);
		}
        if (connection === false)
            throw new Error(`Can not connect database`);

        this.#dbPool = dbPool;

		// setting regular database ping to keep connection alive
		const pingInterval = dbConfig.ping_interval;
		console.log(`Database ping interval : ${pingInterval}s`);
        let interrupt = false;
		setInterval( async () => {
			try {
				await dbPool.query('SELECT 1');
                if (interrupt) {
				    console.log('Database connection resumed'); 
                    interrupt = false;
                }
			} catch(error) {
                if (! interrupt) {
				    console.log('Database connection lost'); 
                }
				console.log(`Database ping error : ${error.message}`);
                interrupt = true;
			}
		}, pingInterval * 1000);

        // company model is used by user model
        this.#companyModel = CompanyModelSingleton.getInstance();
        this.#userModel = UserModelSingleton.getInstance();
        this.#tokenModel = TokenModelSingleton.getInstance();
        this.#authModel = AuthModelSingleton.getInstance();
        this.#accountModel = AccountModelSingleton.getInstance();
        this.#adminModel = AccountModelSingleton.getInstance();
        this.#unitModel = UnitModelSingleton.getInstance();

        // IMPORTANT : do not change modele declaration order because of module dependencies
        this.#userModel.initialize(dbPool, config.security.hashSalt);
        this.#tokenModel.initialize(dbPool);
        this.#authModel.initialize(dbPool, config.security); // authModel depends on userModel and tokenModel
        this.#accountModel.initialize(dbPool); // authModel depends on authModel
        this.#adminModel.initialize(dbPool);
        this.#companyModel.initialize(dbPool);
        this.#unitModel.initialize(dbPool);
        
        const adminEmail = config.admin.email;
        const adminPassword = config.admin.password;
        if (adminEmail !== null && adminPassword !== null) {
            let adminUser = await this.#userModel.getUserByEmail(adminEmail);
            if (adminUser === null) {
                console.log(`Create admin user with email «${adminEmail}»`);
                adminUser = await this.#userModel.createUser({
                    email: adminEmail,
                    password: adminPassword,
                    administrator: true,
                    state: AccountState.ACTIVE
                });
            }
        }
    }

    async terminate() {
        if (this.#dbPool !== null)
            return;
        await this.#dbPool.end();
        this.#dbPool = null;
    }

    async checkAccess() {
        const rows = await this.#dbPool.query('SELECT 1');
        // [ RowDataPacket { '1': 1 } ]
        if (! (rows instanceof Array))
            throw new Error('Invalid result');
        if (rows.length !== 1)
            throw new Error('Invalid result');
        const res = rows[0];
        if (! (rows instanceof Object))
            throw new Error('Invalid result');
    }

    getCompanyModel() {
        return this.#companyModel;
    }

    getUserModel() {
        return this.#userModel;
    }

    getAdminModel() {
        return this.#adminModel;
    }

    getAccountModel() {
        return this.#accountModel;
    }

    getTokenModel() {
        return this.#tokenModel;
    }

    getAuthModel() {
        return this.#authModel;
    }

    getUnitModel() {
        return this.#unitModel;
    }

}

class ModelSingleton {

	constructor() {
		throw new Error('Can not instanciate ModelSingleton!');
	}

	static getInstance() {
		if (! ModelSingleton.instance)
			ModelSingleton.instance = new Model();
		return ModelSingleton.instance;
	}
}

export default ModelSingleton;
