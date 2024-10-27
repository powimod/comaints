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

    async jsonFull(routeUrl, httpMethod, options, requestBody) {
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

        const methodsWithBody = ['POST', 'PUT', 'PATCH']
        if (methodsWithBody.includes(httpMethod))
            fetchParam.body = JSON.stringify(requestBody)

        const response = await fetch(url, fetchParam)
        if (! response.ok) {
            let errorMessage = 'Unknown error'
            try {
                const jsonError = await response.json()
                //console.log("JSON Error : ", jsonError)
                errorMessage = jsonError.message
            }
            catch(error) {
                const text = await response.text()
                errorMessage = text
            }
            throw new Error(errorMessage)
        }

        const jsonResponse = await response.json()

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


    async jsonGet(routeUrl, options={}) {
        return await this.jsonFull(routeUrl, 'GET', options)
    }

    async jsonPost(routeUrl, body, options={}) {
        return await this.jsonFull(routeUrl, 'POST', options, body)
    }

    async jsonPut(routeUrl, body, options={}) {
        return await this.jsonFull(routeUrl, 'PUT', options, body)
    }

    async jsonPatch(routeUrl, body, options={}) {
        return await this.jsonFull(routeUrl, 'PATCH', options, body)
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
