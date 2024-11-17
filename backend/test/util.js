'use strict'

import fs from 'fs'
import dotenv from 'dotenv'
import promise_mysql from 'promise-mysql'


const CONF_FILE = './test/.env'
dotenv.config({ path: CONF_FILE });

let backendUrl = null
let db = null
let dbHost
let dbPort
let dbDatabase
let dbUser
let dbPassword
let accessToken = null
let refreshToken = null


const loadConfig = () => {
    backendUrl = process.env.BACKEND_URL
    if (backendUrl === undefined)
        throw new Error(`Parameter «BACKEND_URL» not found in «${CONF_FILE}»`)

    dbHost = process.env.DB_HOST || 'localhost'
    dbPort = process.env.DB_PORT || 3306
    dbDatabase = process.env.DB_DATABASE || 'db_comaint'
    dbUser = process.env.DB_USER || 'comaint'
    dbPassword = process.env.DB_PASSWORD
    if (dbPassword === undefined)
        throw new Error(`Parameter «DB_PASSWORD» not found in «${CONF_FILE}»`)
}

const jsonFull = async (routeUrl, httpMethod, options = {}, requestParams = {}) => {
    if (! backendUrl)
        throw new Error('Config not loaded')

    if (routeUrl.startsWith('/'))
        routeUrl = routeUrl.substr(1)
    let url = new URL(`${backendUrl}/${routeUrl}`)
    //console.log("Request URL", url)

    const lang = options.lang ?? 'en'

    const fetchParam = {
        method : httpMethod,
        headers:  {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Accept-Language': lang
        }
    }

    if (accessToken !== null)
        fetchParam.headers['x-access-token'] = accessToken

    const methodsWithBody = ['POST', 'PUT', 'PATCH']
    if (methodsWithBody.includes(httpMethod)) {
        fetchParam.body = JSON.stringify(requestParams)
    }
    else {
        for (const [ paramName, paramValue ] of Object.entries(requestParams))
           url.searchParams.append(paramName, paramValue)
    }
    const response = await fetch(url, fetchParam)

    // Interpret response before HTTP status
    const contentType = response.headers.get('content-type');
    if (! contentType)
        throw new Error('API response content type not found')


    if (contentType.includes('text/html')) {
        const textResponse = await response.text()
        throw new Error(textResponse)
    }

    if (! contentType.includes('application/json'))
        throw new Error(`API response content type is not JSON (${contentType}`)

    const jsonResponse = await response.json()

    // Detect access/refresh token parameters
    // (they are null to unset them when logout route is called)
    if (jsonResponse['access-token'] !== undefined)
        accessToken = jsonResponse['access-token']
    if (jsonResponse['refresh-token'] !== undefined)
        refreshToken = jsonResponse['refresh-token']

    if (! response.ok) {
        const message = jsonResponse.message ? jsonResponse.message : JSON.stringify(jsonResponse)
        throw new Error(message)
    }

    return jsonResponse
}


const jsonGet = async (routeUrl, params, options) => {
    return await jsonFull(routeUrl, 'GET', options, params)
}

const jsonPost = async (routeUrl, params, options) => {
    return await jsonFull(routeUrl, 'POST', options, params)
}

const jsonPut = async (routeUrl, params, options) => {
    return await jsonFull(routeUrl, 'PUT', options, params)
}

const jsonPatch = async (routeUrl, params, options) => {
    return await jsonFull(routeUrl, 'PATCH', options, params)
}

const jsonDelete = async (routeUrl, options) => {
    return await jsonFull(routeUrl, 'DELETE', options)
}

const prepareRequestPath = (path, params) => {
    for (const [paramName, paramValue] of Object.entries(params))
        path = path.replace(`{{${paramName}}}`, paramValue)
    return path
}


const connectDb = async () => {
    db = await promise_mysql.createConnection({
        host: dbHost,
        port: dbPort,
        database: dbDatabase,
        user: dbUser,
        password: dbPassword
    })
    if (db.code)
        throw new Error(`Can't connect database`)
}

const disconnectDb = async () => {
    accessToken = null
    refreshToken = null
    if (db === null)
        return
    db.end()
    db = null
}

const requestDb = async (sqlQuery, sqlValues = []) => {
    if (db === null)
        await connectDb()
    const result = await db.query(sqlQuery, sqlValues);
    if (result.code)
        throw new Error(`SQL error : ${result.code}`)
    return result
}

const util = {
    loadConfig,
    jsonGet,
    jsonPost,
    jsonPut,
    jsonPatch,
    jsonDelete,
    connectDb,
    disconnectDb,
    requestDb,
    accessToken,
    refreshToken
}

export default util
export {
    loadConfig,
    jsonGet,
    jsonPost,
    jsonPut,
    jsonPatch,
    jsonDelete,
    prepareRequestPath,
    connectDb,
    disconnectDb,
    requestDb,
    accessToken,
    refreshToken
}

