'use strict'

class View {
    #config = null

    initialize(config) {
        this.#config = config
    }

    json(response, jsonContent) {
        // use «response.send()» instead of «response.json()» to add a CR at the end
        response.send(JSON.stringify(jsonContent) + '\n')
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
