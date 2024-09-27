'use strict'

class Model {
    #config = null

    async initialize(config) {

        if (config.database === undefined)
            throw new Error(`Config «database» section not defined`)

        const parameterNames = [ 'name', 'host', 'port', 'account', 'password' ]
        for (const parameterName of parameterNames) {
            if (config.database[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined`)
        }

        this.#config = config
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
