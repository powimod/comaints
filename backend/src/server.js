'use strict'
const BACKEND_VERSION = '0.0.1'

import express from 'express'
import dotenv from 'dotenv'

import ModelSingleton from './model.js'
import ViewSingleton from './view.js'
import ControllerSingleton from './controller.js'

dotenv.config()

const main = async () => {

    const app = express()
    app.use(express.json())
    app.use(express.urlencoded({extended: true}))

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
            name: process.env.DB_NAME || 'bdd_woodstock',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306, // MySQL default port
            user: process.env.DB_USER || 'admin',
            password: DB_PASSWORD
        }
    }

	let model  = ModelSingleton.getInstance()
	await model.initialize(config)

	let view = ViewSingleton.getInstance()
	await view.initialize(config)

	let controller = ControllerSingleton.getInstance()
	await controller.initialize(config, app)


    process.on('SIGINT', async () => {
        console.log('Stopping Comaint backend...')
	    await model.terminate()
        process.exit(0)
    })


    const port = config.server.port
    app.listen(
        port, 
        () => { // success
            console.log(`Comaint backend listening on ${port}...`)
        }
    )

}


main().
catch (error => {
	const message = error.message ? error.message : error
    console.error(`ERROR : Can not start Comaint backend : ${message}`)
	process.exit(1)
})
