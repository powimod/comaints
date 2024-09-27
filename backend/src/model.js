'use strict'

import mysql from 'promise-mysql'

import { sleep } from './util.js'

class Model {
    #config = null
    #dbConnection = null


    async initialize(config) {

        const dbConfig = config.database
        if (dbConfig === undefined)
            throw new Error(`Config «database» section not defined`)

        for (const parameterName of [ 'name', 'host', 'port', 'user', 'password', 'retry_interval', 'max_retries' ]) {
            if (dbConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`)
        }


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
                dbConnection = await mysql.createConnection(dbConfig)
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
        this.#config = config
    }


    async terminate() {
        if (! this.#dbConnection)
            return
        await this.#dbConnection.end()
        this.#dbConnection = null
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
