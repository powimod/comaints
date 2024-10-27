'use strict'

class AuthApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async login(email, password) {
        if (email === undefined)
            throw new Error("Argument «email» not defined")
        if (password === undefined)
            throw new Error("Argument «password» not defined")
        const LOGIN_ROUTE = '/api/v1/auth/login'
        const response = await this.#context.jsonPost(LOGIN_ROUTE, {email, password})
        return response
    }

    async register({email, password, sendMail = true}) {
        if (email === undefined)
            throw new Error("Argument «email» not defined")
        if (password === undefined)
            throw new Error("Argument «password» not defined")
        const REGISTER_ROUTE = '/api/v1/auth/register'
        const response = await this.#context.jsonPost(REGISTER_ROUTE, {
            email,
            password,
            sendCodeByEmail: sendMail
        })
        console.log(response)
        return response
    }

}
export default AuthApi
