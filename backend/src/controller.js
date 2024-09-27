'use strict'

class Controller {
    #config = null

    async initialize(config) {
        this.#config = config
    }

}

class ControllerSingleton {

	constructor() {
		throw new Error('Can not instanciate ControllerSingleton!')
	}

	static getInstance() {
		if (! ControllerSingleton.instance)
			ControllerSingleton.instance = new Controller()
		return ControllerSingleton.instance
	}
}

export default ControllerSingleton
