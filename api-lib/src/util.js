'use strict'

const jsonFull = async (backendUrl, routeUrl, httpMethod, options, requestBody) => {

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
        const message = await response.text()
        //console.log("Erreur : ", message)
		throw new Error(`Server status ${response.status} (${message})`)
    }
	return await response.json()
}


const jsonGet = async (backendUrl, routeUrl, options = {}) => {
	return await jsonFull(backendUrl, routeUrl, 'GET', options)
}

const jsonPost = async (backendUrl, routeUrl, body, options = {}) => {
	return await jsonFull(backendUrl, routeUrl, 'POST', options, body)
}

const jsonPut = async (backendUrl, routeUrl, body, options = {}) => {
	return await jsonFull(backendUrl, routeUrl, 'PUT', options, body)
}

const jsonPatch = async (backendUrl, routeUrl, body, options = {}) => {
	return await jsonFull(backendUrl, routeUrl, 'PATCH', options, body)
}

const jsonDelete = async (backendUrl, routeUrl, options = {}) => {
	return await jsonFull(backendUrl, routeUrl, 'DELETE', options)
}


export {
	jsonGet,
	jsonPost,
	jsonPut,
	jsonPatch,
	jsonDelete
}
