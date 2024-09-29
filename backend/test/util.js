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

const jsonFull = async (routeUrl, httpMethod, requestBody) => {
	if (! backendUrl)
        throw new Error('Config not loaded')
    if (routeUrl.startsWith('/'))
        routeUrl = routeUrl.substr(1)
	let url=`${backendUrl}/${routeUrl}`
	const fetchParam = {
		method : httpMethod,
		headers:  {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Accept-Language': 'fr, fr-FR'
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


const jsonGet = async (routeUrl) => {
	return await jsonFull(routeUrl, 'GET')
}

const jsonPost = async (routeUrl, body) => {
	return await jsonFull(routeUrl, 'POST', body)
}

const jsonPut = async (routeUrl, body) => {
	return await jsonFull(routeUrl, 'PUT', body)
}

const jsonPatch = async (routeUrl, body) => {
	return await jsonFull(routeUrl, 'PATCH', body)
}

const jsonDelete = async (routeUrl) => {
	return await jsonFull(routeUrl, 'DELETE')
}

export {
	loadConfig,
	jsonGet,
	jsonPost,
	jsonPut,
	jsonPatch,
	jsonDelete
}

