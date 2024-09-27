'use strict'

import mysql from 'promise-mysql'

class Model {
    #config = null
    #dbConnection = null

    async initialize(config) {

        const dbConfig = config.database
        if (dbConfig === undefined)
            throw new Error(`Config «database» section not defined`)

        for (const parameterName of [ 'name', 'host', 'port', 'user', 'password' ]) {
            if (dbConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`)
        }


        // TODO add a retry loop
        const dbConnection = await mysql.createConnection(dbConfig)

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
