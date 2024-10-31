'use strict'

import { comaintErrors, ComaintApiErrorInvalidResponse } from '../../common/src/error.mjs' 

class Context{
    #backendUrl = null
    #accountSerializeFunction = null
   
    #refreshToken = null
    #accessToken = null

    constructor(backendUrl, accountSerializeFunction) {

        if (accountSerializeFunction === null) {
            let accountData = null
            // default serialize function with in memory storage
            accountSerializeFunction = (data) => {
                if (data === undefined)
                    data = JSON.parse(accountData)
                else
                    accountData = JSON.stringify(data)
                return data
            }
        }
        this.#backendUrl = backendUrl
        this.#accountSerializeFunction = accountSerializeFunction
        this.#loadAccount()
    }


    async jsonFull(routeUrl, httpMethod, options={}, parameters=null) {
        if (routeUrl.startsWith('/'))
            routeUrl = routeUrl.substr(1)
        let url=`${this.#backendUrl}/${routeUrl}`

        const lang = options.lang ?? 'en'

        // par défaut, envoyer gérer l'envoi des jetons
        const sendToken = options.token ?? false

        const fetchParam = {
            method : httpMethod,
            headers:  {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Accept-Language': lang
            }
        }

        if (sendToken) {
            if (this.#accessToken === null)
                throw new Error('Access token not found')
            if (this.#refreshToken === null)
                throw new Error('Refresh token not found')
        }

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

        let globalResult = null
        let globalError = null

        // Déterminer le nombre de tentatives d'envoi de requête HTTP : 
        // • une seule tentative pour les routes publiques (pas de gestion de jeton)
        // • deux tentatives maximum pour les routes privées :
        //      • une première tentative avec le jeton d'accès (éventuellement périmé)
        //      • une seconde tentative avec le jeton de rafraîchissement (pour renouveler un jeton d'accès périmé)
        const maxRetryCount = sendToken ? 2 : 1

        // Faire une ou deux tentatives d'envoi de la requête
        for (let retry = 1 ; retry <= maxRetryCount; retry++)
        {
            if (sendToken) {
                if (retry === 1) {
                    // première tentative : envoyer le jeton d'accès (même s'il est périmé)
                    fetchParam.headers['x-access-token'] = this.#accessToken
                }
                else {
                    // deuxième tentative : envoyer le jeton de renouvellement 
                    // (le jeton d'accès avait été détecté comme périmé à la première tentative)
                    fetchParam.headers['x-refresh-token'] = this.#refreshToken
                }
            }

            // envoyer la requête au backend
            let response = null
            try {
                response = await fetch(url, fetchParam)
            }
            catch (error) {
                // le messsage d'erreur error.message contient l'erreur générique «fetch failed» 
                // la cause véritable se trouve dans error.cause.message.
                const errorMessage = error.cause?.message || error.message
                // en cas d'erreur fetch, sortir immédiatement en erreur en transmettant l'erreur
                globalError = new Error(errorMessage)
                globalError.errorId = 'communicationError'
                break
            }

            // Interpréter la réponse en fonction du type MIME de l'entête HTTP
            let jsonResponse = null
            const contentType = response.headers.get("content-type") || ''
            if (contentType.includes("application/json")) {
                // Inteprétation en tant que JSON (normalement toutes les erreurs renvoyées par le backend sont en JSON)
                jsonResponse = await response.json()
            }
            else {
                // Inteprétation en tant que texte (ne devrait jamais se produire)
                const texte = await response.text()
                jsonResponse = { 
                    message: texte,
                    errorId: 'UnknownError'
                }
            }

            // Cas où la requête HTTP a échoué
            if (! response.ok) {

                // Sortir en erreur si la réponse du backend ne contient pas les propriétés «message» et «error»
                // (ne devrait jamais se produire)
                if (jsonResponse.message === undefined || jsonResponse.error === undefined) {
                    globalError = new ComaintApiErrorInvalidResponse()
                    break
                }

                // Construire une erreur à partir de la réponse JSON
                const error = new Error(jsonResponse.message)
                error.errorId = jsonResponse.error

                // Sortir en erreur si l'erreur rencontrée n'est pas liée à un problème de jeton
                if (! sendToken) {
                    globalError = error
                    break
                }

                // Sortir en erreur si c'est la seconde tentative
                if (retry === 2) {
                    globalError = error
                    break
                }

                // Sortir en erreur si l'erreur ne vient pas d'un jeton d'accès périmé
                if (jsonResponse.error !== comaintErrors.INVALID_TOKEN) {
                    globalError = error
                    break
                }

                // Arrivé ici, le problème vient du jeton d'accès qui est périmé :
                // dans ce cas, il faut boucler sur une seconde tentative qui enverra le jeton de rafraîchissement
                continue
            }

            // si la réponse contient des jetons, les récupérer
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

            // demander au client de sauver les jetons
            if (tokenFound)
                this.#saveAccount()

            // la requête HTTP a réussi : sortir
            globalResult = jsonResponse
            break
        }
        if (globalError !== null) {
            throw globalError
        }
        return globalResult
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
