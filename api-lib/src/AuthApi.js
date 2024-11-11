'use strict'

class AuthApi {

    #context = null

    constructor(context) {
        this.#context = context
    }

    async login(email, password) {
        if (email === undefined)
            throw new Error('Argument «email» not defined')
        if (password === undefined)
            throw new Error('Argument «password» not defined')
        const LOGIN_ROUTE = '/api/v1/auth/login'
        await this.#context.jsonPost(LOGIN_ROUTE, {email, password}, {token:false})
    }

    async logout() {
        const LOGOUT_ROUTE = '/api/v1/auth/logout'
        const response = await this.#context.jsonPost(LOGOUT_ROUTE, null, {token:true})
        return response
    }


    async register({email, password, sendMail = true}) {
        if (email === undefined)
            throw new Error('Argument «email» not defined')
        if (password === undefined)
            throw new Error('Argument «password» not defined')
        const REGISTER_ROUTE = '/api/v1/auth/register'
        const response = await this.#context.jsonPost(REGISTER_ROUTE, {
            email,
            password,
            sendCodeByEmail: sendMail
        }, {
            token:false
        })
        return response
    }

    async validate({email, code}) {
        if (code === undefined)
            throw new Error('Argument «code» not defined')
        const VALIDATE_ROUTE = 'api/v1/auth/validate'
        let response
        if (email !== undefined)
            response= await this.#context.jsonPost(VALIDATE_ROUTE, {email, code}, {token:false})
        else
            response= await this.#context.jsonPost(VALIDATE_ROUTE, {code}, {token:true})
        if (response.validated === undefined)
            throw new Error('Invalid backend response')
        const result = response.validated
        return response
    }

    async resetPassword(email, password) {
        const ROUTE = 'api/v1/auth/reset-password'
        const response = await this.#context.jsonPost(ROUTE, {email, password}, {token:false})
        return response
    }

    async resendCode(email) {
        const ROUTE = 'api/v1/auth/resend-code'
        const response = await this.#context.jsonPost(ROUTE, {email}, {token:false})
        return response
    }


}
export default AuthApi
