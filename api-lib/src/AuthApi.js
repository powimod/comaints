import { jsonGet, jsonPost } from './util.js'

class AuthApi {

    #backendUrl = null

    constructor(backendUrl) {
        this.#backendUrl = backendUrl
    }

    async login(email, password) {
        if (email === undefined)
            throw new Error("Argument «email» not defined")
        if (password === undefined)
            throw new Error("Argument «password» not defined")
        const LOGIN_ROUTE = '/api/v1/auth/login'
        response = await jsonPost(this.#backendUrl, LOGIN_ROUTE, {email, password})
    }

}
export default AuthApi
