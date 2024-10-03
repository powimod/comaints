'se strict'


class AuthModel {
    #db = null

    initialize (db) {
        this.#db = db
    }


}


class AuthModelSingleton {

    static #instance = null

	constructor() {
		throw new Error('Can not instanciate AuthModelSingleton!')
	}

	static getInstance() {
		if (! AuthModelSingleton.#instance)
			AuthModelSingleton.#instance = new AuthModel()
		return AuthModelSingleton.#instance
	}
}

export default AuthModelSingleton
