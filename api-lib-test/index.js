'use strict'
import dotenv from 'dotenv'

//import { checkApiLib } from 'comaint-api-lib'
import { ComaintBackendApi } from 'comaint-api-lib'

dotenv.config()

const main = async () => {
    const backendUrl = process.env.BACKEND_URL
    if (! backendUrl)
        throw new Error('backendUrl not defined')
    const api = new ComaintBackendApi(backendUrl)
    const ret = api.checkApiLib()
    if (! ret.success)
        throw new Error(ret.message)
    console.log(ret.message)

}

main()
/* TODO reactivate this
. catch (error => {
	const message = error.message ? error.message : error
    console.error(`ERROR : ${message}`)
	process.exit(1)
})
*/
