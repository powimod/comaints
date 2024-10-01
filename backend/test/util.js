'use strict'

import fs from 'fs'
import dotenv from 'dotenv'

const CONF_FILE = './test/.env'
dotenv.config({ path: CONF_FILE });

let backendUrl = null

const loadConfig = () => {
	backendUrl = process.env.backend_url

	if (backendUrl === undefined)
		throw new Error(`Parameter «backend_url» not found in «${CONF_FILE}»`)

}

const jsonFull = async (routeUrl, httpMethod, options, requestBody) => {
	if (! backendUrl)
        throw new Error('Config not loaded')

    if (routeUrl.startsWith('/'))
        routeUrl = routeUrl.substr(1)
	let url=`${backendUrl}/${routeUrl}`

    const lang = options.lang ?? 'en'

	const fetchParam = {
		method : httpMethod,
		headers:  {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Accept-Language': lang 
		}
	}

    const methodsWithBody = ['POST', 'PUT', 'PATCH']
	if (methodsWithBody.includes(httpMethod))
		fetchParam.body = JSON.stringify(requestBody)

	const response = await fetch(url, fetchParam)
	if (! response.ok) {
        //console.log(response)
        const message = await response.text()
        //console.log("Erreur : ", message)
		throw new Error(`Server status ${response.status} (${message})`)
    }
	return await response.json()
}


const jsonGet = async (routeUrl, options = {}) => {
	return await jsonFull(routeUrl, 'GET', options)
}

const jsonPost = async (routeUrl, body, options = {}) => {
	return await jsonFull(routeUrl, 'POST', options, body)
}

const jsonPut = async (routeUrl, body, options = {}) => {
	return await jsonFull(routeUrl, 'PUT', options, body)
}

const jsonPatch = async (routeUrl, body, options = {}) => {
	return await jsonFull(routeUrl, 'PATCH', options, body)
}

const jsonDelete = async (routeUrl, options = {}) => {
	return await jsonFull(routeUrl, 'DELETE', options)
}

export {
	loadConfig,
	jsonGet,
	jsonPost,
	jsonPut,
	jsonPatch,
	jsonDelete
}

