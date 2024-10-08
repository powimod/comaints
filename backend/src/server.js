'use strict'
const BACKEND_VERSION = '0.0.1'

import express from 'express'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'
import dotenv from 'dotenv'

import ModelSingleton from './model.js'
import ControllerSingleton from './controller.js'

dotenv.config()

const main = async () => {

    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

    // i18n support
    i18next.use(Backend).use(middleware.LanguageDetector).init({
        fallbackLng: 'en',
        preload: ['en', 'fr'],
        backend: {
            loadPath: './locales/{{lng}}/translation.json'
        }
    })
    app.use(middleware.handle(i18next))

    // configuration is defined in «.env» file
    const DB_PASSWORD = process.env.DB_PASSWORD
    if (! DB_PASSWORD)
        throw new Error('DB_PASSWORD not defined')

    let config = {
        version: BACKEND_VERSION,
        server: {
            port: process.env.PORT || 9101
        },
        database: {
            name: process.env.DB_NAME || 'comaint',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306, // MySQL default port
            user: process.env.DB_USER || 'admin',
            retry_interval: process.env.DB_RETRY_INTERVAL || 10, // seconds
            max_retries: process.env.DB_MAX_RETRIES || -1, // -1:infinity
            password: DB_PASSWORD
        }
    }

	const model = ModelSingleton.getInstance()
	await model.initialize(config)

	const controller = ControllerSingleton.getInstance()
	await controller.initialize(config, app)


    // catch CTRL+C interuption
    process.on('SIGINT', async () => {
        console.log('Stopping Comaint backend...')
	    await model.terminate()
        process.exit(0)
    })


    const port = config.server.port
    
    // use a Promise to transmit connection error to the main caller
    const expressServer = await new Promise( (resolve, reject) => {
        const server = app.listen(
            port, 
            () => { // success
                console.log(`Comaint backend listening on ${port}...`)
                resolve(server)
            }
        )
        server.on('error', (error) => {
            reject(error)
        })
    })

}


main()
/* TODO reactivate this
. catch (error => {
	const message = error.message ? error.message : error
    console.error(`ERROR : Can not start Comaint backend : ${message}`)
	process.exit(1)
})
*/
