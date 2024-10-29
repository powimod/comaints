'use strict'

class Context{
    #backendUrl = null
    #accountSerializeFunction = null
   
    #refreshToken = null
    #accessToken = null

    constructor(backendUrl, accountSerializeFunction) {
        this.#backendUrl = backendUrl
        this.#accountSerializeFunction = accountSerializeFunction
        this.#loadAccount()
    }


    async jsonFull(routeUrl, httpMethod, options={}, parameters=null) {
        if (routeUrl.startsWith('/'))
            routeUrl = routeUrl.substr(1)
        let url=`${this.#backendUrl}/${routeUrl}`

        const lang = options.lang ?? 'en'

        const fetchParam = {
            method : httpMethod,
            headers:  {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': lang
            }
        }
        if (this.#accessToken !== null)
            fetchParam.headers['x-access-token'] = this.#accessToken

        if (parameters !== null) {
            const methodsWithBody = ['POST', 'PUT', 'PATCH']
            if (methodsWithBody.includes(httpMethod)) {
                fetchParam.body = JSON.stringify(parameters)
            }
            else {
                const queryString = new URLSearchParams(parameters).toString()
                url += `?${queryString}`
            }
        }



        let response = null
        try {
            response = await fetch(url, fetchParam)

            // interpret response as JSON or as text
            let jsonResponse = null
            const contentType = response.headers.get("content-type") || ''
            if (contentType.includes("application/json")) {
                jsonResponse = await response.json()
            }
            else {
                const texte = await response.text()
                jsonResponse = { message: texte }
            }

            if (! response.ok) {
                const error = new Error(jsonResponse.message)
                error.errorId = jsonResponse.error || '?'
                throw error
            }

            let tokenFound = false
            const accessToken = jsonResponse['access-token']
            if (accessToken !== undefined) {
                this.#accessToken = accessToken
                tokenFound = true
            }
            const refreshToken = jsonResponse['refresh-token']
            if (refreshToken !== undefined) {
                this.#refreshToken = refreshToken
                tokenFound = true
            }
            if (tokenFound)
                this.#saveAccount()
            return jsonResponse
        }
        catch (error) {
            // fetch error : code="ECONNREFUSED"
            throw error
        }

    }


    async jsonGet(routeUrl, parameters, options) {
        return await this.jsonFull(routeUrl, 'GET', options, parameters)
    }

    async jsonPost(routeUrl, parameters, options={}) {
        return await this.jsonFull(routeUrl, 'POST', options, parameters)
    }

    async jsonPut(routeUrl, parameters, options={}) {
        return await this.jsonFull(routeUrl, 'PUT', options, parameters)
    }

    async jsonPatch(routeUrl, parameters, options={}) {
        return await this.jsonFull(routeUrl, 'PATCH', options, parameters)
    }

    async jsonDelete(routeUrl, options={}) {
        return await this.jsonFull(routeUrl, 'DELETE', options)
    }

    #loadAccount() {
        let result = this.#accountSerializeFunction()
        if (result === null)
            result = {refreshToken:null, accessToken: null}
        if (! (result instanceof Object))
            throw new Error('Serialize function does not return an object')
        const {refreshToken, accessToken} = result
        if (refreshToken !== null && typeof(refreshToken) !== 'string')
            throw new Error('Invalid refresh token')
        if (accessToken !== null && typeof(accessToken) !== 'string')
            throw new Error('Invalid access token')
        this.#refreshToken = refreshToken
        this.#accessToken = accessToken
    }

    #saveAccount() {
        const accessToken = this.#accessToken
        const refreshToken = this.#refreshToken
        this.#accountSerializeFunction({ accessToken, refreshToken})
    }
}

export default Context
