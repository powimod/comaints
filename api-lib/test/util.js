'use strict'
import dotenv from 'dotenv'

import ComaintBackendApi from '../src/ComaintBackendApi.js'

dotenv.config({ path: './test/.env' })

let accountData = null

const accountSerializeFunction = (data) => {
    if (data === undefined)
        data = JSON.parse(accountData)
    else
        accountData = JSON.stringify(data)
    return data
}

const initializeApi = () => {
    const backendUrl = process.env.BACKEND_URL
    if (! backendUrl)
        throw new Error('Env variable «BACKEND_URL» is not defined')
    const api = new ComaintBackendApi(backendUrl, accountSerializeFunction)
    return api
}

export { initializeApi }
