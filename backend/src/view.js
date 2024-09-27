'use strict'

class View {
    #config = null

    async initialize(config) {
        this.#config = config
    }

}

class ViewSingleton {

	constructor() {
		throw new Error('Can not instanciate ViewSingleton!')
	}

	static getInstance() {
		if (! ViewSingleton.instance)
			ViewSingleton.instance = new View()
		return ViewSingleton.instance
	}
}

export default ViewSingleton
