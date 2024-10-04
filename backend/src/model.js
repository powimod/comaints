'use strict'

import mysql from 'promise-mysql'

import { sleep } from './util.js'
import CompanyModelSingleton  from './models/CompanyModel.js'
import AuthModelSingleton  from './models/AuthModel.js'

class Model {
    #config = null
    #dbConnection = null
    #authModel = null
    #companyModel = null

    async initialize(config) {

        // check «database» configuration section 
        const dbConfig = config.database
        if (dbConfig === undefined)
            throw new Error(`Config «database» section not defined`)
        const dbParameterNames = [ 
            'name', 'host', 'port', 'user', 'password', 
            'retry_interval', 'max_retries'
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

        this.#companyModel = CompanyModelSingleton.getInstance()
        this.#companyModel.initialize(dbConnection)

        this.#authModel = AuthModelSingleton.getInstance()
        this.#authModel.initialize(dbConnection, config.security)

        this.#dbConnection = dbConnection
        this.#config = config.TOKEN_SECRET
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

    getAuthModel() {
        return this.#authModel
    }
    getCompanyModel() {
        return this.#companyModel
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
