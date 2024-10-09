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
    if (! response.ok) {
        /*
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const jsonResponse = await response.json()
            const textResponse = JSON.stringify(jsonResponse)
            throw new Error(`Server status ${response.status} (${textResponse})`)
        } else {
            const textResponse = await response.text()
            throw new Error(`Server status ${response.status} (${textResponse})`)
        }
        */
        const textResponse = await response.text()
        throw new Error(`Server status ${response.status} (${textResponse})`)
    }

    const json = await response.json()

    // detect access/refresh token parameters in JSON response
    // (they are null to unset them when logout route is called)
    if (json['access-token'] !== undefined)
        accessToken = json['access-token']
    if (json['refresh-token'] !== undefined)
        refreshToken = json['refresh-token']

    return json
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
    connectDb,
    disconnectDb,
    requestDb,
    accessToken,
    refreshToken 
}

