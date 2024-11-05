'use strict'
import dotenv from 'dotenv'
dotenv.config()

import { ComaintBackendApi } from 'comaint-api-lib'

let accountData = null
const accountSerializeCallback = (data) => {
    if (data === undefined)
        data = JSON.parse(accountData)
    else
        accountData = JSON.stringify(data)
    return data
}

const main = async () => {
    const backendUrl = process.env.BACKEND_URL
    if (! backendUrl)
        throw new Error('backendUrl not defined')
    const api = new ComaintBackendApi(backendUrl, accountSerializeCallback)

    console.log("Checking API library...")
    let ret = api.checkApiLib()
    if (! ret.success)
        throw new Error(ret.message)
    console.log(`\t→ ${ret.message}`)

    console.log("Checking backend communication...")
    ret = await api.checkBackend()
    if (! ret.success)
        throw new Error(ret.message)
    console.log(`\t→ ${ret.message}`)

    console.log("Search API version...")
    try {
        let version = await api.getApiVersion()
        console.log(`\t→ API version : ${version}`)
   
        console.log("Search backend version...")
        version = await api.getBackendVersion()
        console.log(`\t→ backend version : ${version}`)
     
        console.log("Check error handling...")
        ret = await api.welcome({}) // missing arguments «firstname» and «lastname» in request
        if (ret.success) 
            throw new Error('Error handling is not workinkg')
        console.log(`\t→ done`)
    }
    catch (error) {
        console.error(`ERROR: ${error}`)
    }
    console.log('End')
}

main()
. catch (error => {
	const message = error.message ? error.message : error
    console.error(`ERROR : ${message}`)
	process.exit(1)
})
