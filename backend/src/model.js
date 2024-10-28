'use strict'

import mysql from 'promise-mysql'

import { sleep } from './util.js'
import CompanyModelSingleton  from './models/CompanyModel.js'
import UserModelSingleton     from './models/UserModel.js'
import AccountModelSingleton  from './models/AccountModel.js'
import TokenModelSingleton    from './models/TokenModel.js'
import AuthModelSingleton     from './models/AuthModel.js'

class Model {
    #config = null
    #dbConnection = null
    #authModel = null
    #accountModel = null
    #companyModel = null
    #userModel = null
    #tokenModel = null

    async initialize(config) {
        this.#config = config

        // check «database» configuration section 
        const dbConfig = config.database
        if (dbConfig === undefined)
            throw new Error(`Config «database» section not defined`)
        const dbParameterNames = [ 
            'name', 'host', 'port', 'user', 'password', 
            'retry_interval', 'max_retries', 'ping_interval'
        ]
        for (const parameterName of dbParameterNames ) {
            if (dbConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`)
        }

        // check «security» configuration section 
        if (config.security === undefined)
            throw new Error(`Config «security» section not defined`)

		// connection retry loop
		const retryInterval = dbConfig.retry_interval
		let maxRetries = dbConfig.max_retries
        if (maxRetries < 0)
            maxRetries = Infinity
		this.#dbConnection = null
		let dbConnection = null
		for (let retry = 0; retry < maxRetries ; retry++){
			console.log(`Connecting database ...`)
			try {
                dbConnection = await mysql.createConnection({
                    host: dbConfig.host,
                    database: dbConfig.name,
                    user: dbConfig.user,
                    password: dbConfig.password,
                })
				if (dbConnection.code === undefined)
					break
				console.error(`Can not open database : ${db.code}`)
				dbConnection = null
			}
			catch (error) {
				console.log(`Database connection error : ${error.message}`)
			}
		    dbConnection = null
			console.log(`Connection retry n°${retry+1}/${maxRetries} : waiting ${retryInterval}s...`)
			await sleep(retryInterval * 1000)
		}
        if (dbConnection === null)
            throw new Error(`Can not connect database`)
        this.#dbConnection = dbConnection

		// setting regular database ping to keep connection alive
		const pingInterval = dbConfig.ping_interval
		console.log(`Database ping interval : ${pingInterval}s`)
		setInterval( () => {
			try {
				dbConnection.query('SELECT 1')
			} catch(error) {
				console.log(`Database ping error : ${error.message}`)
			}
		}, pingInterval * 1000)


        // IMPORTANT : do not change modele declaration order because of module dependencies
        this.#userModel = UserModelSingleton.getInstance()
        this.#userModel.initialize(dbConnection, config.security.hashSalt)

        this.#tokenModel = TokenModelSingleton.getInstance()
        this.#tokenModel.initialize(dbConnection)

        // authModel depends on userModel and tokenModel
        this.#authModel = AuthModelSingleton.getInstance()
        this.#authModel.initialize(dbConnection, config.security)

        // authModel depends on authModel
        this.#accountModel = AccountModelSingleton.getInstance()
        this.#accountModel.initialize(dbConnection)

        this.#companyModel = CompanyModelSingleton.getInstance()
        this.#companyModel.initialize(dbConnection)
    }

    async terminate() {
        if (! this.#dbConnection)
            return
        await this.#dbConnection.end()
        this.#dbConnection = null
    }

    async checkAccess() {
        const rows = await this.#dbConnection.query('SELECT 1');
        // [ RowDataPacket { '1': 1 } ]
        if (! (rows instanceof Array))
            throw new Error('Invalid result')
        if (rows.length !== 1)
            throw new Error('Invalid result')
        const res = rows[0]
        if (! (rows instanceof Object))
            throw new Error('Invalid result')
    }

    getCompanyModel() {
        return this.#companyModel
    }

    getUserModel() {
        return this.#userModel
    }

    getAccountModel() {
        return this.#accountModel
    }

    getTokenModel() {
        return this.#tokenModel
    }

    getAuthModel() {
        return this.#authModel
    }
}

class ModelSingleton {

	constructor() {
		throw new Error('Can not instanciate ModelSingleton!')
	}

	static getInstance() {
		if (! ModelSingleton.instance)
			ModelSingleton.instance = new Model()
		return ModelSingleton.instance
	}
}

export default ModelSingleton
