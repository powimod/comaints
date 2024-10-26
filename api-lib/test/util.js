'use strict'
import dotenv from 'dotenv'

import ComaintBackendApi from '../src/ComaintBackendApi.js'

dotenv.config({ path: './test/.env' })

const initializeApi = () => {
    const backendUrl = process.env.BACKEND_URL
    if (! backendUrl)
        throw new Error('Env variable «BACKEND_URL» is not defined')
    const api = new ComaintBackendApi(backendUrl)
    return api
}

export { initializeApi }
