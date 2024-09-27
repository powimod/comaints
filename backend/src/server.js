'use strict'
const VERSION = '0.0.1';

import dotenv from 'dotenv'
import ModelSingleton from './model.js'
import ViewSingleton from './view.js'
import ControllerSingleton from './controller.js'

dotenv.config()

const main = async () => {

    // configuration is defined in «.env» file
    const DB_PASSWORD = process.env.DB_PASSWORD
    if (! DB_PASSWORD)
        throw new Error('DB_PASSWORD not defined')

    let config = {
        version: VERSION,
        server: {
            port: process.env.PORT || 9101
        },
        database: {
            name: process.env.DB_NAME || 'bdd_woodstock',
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306, // MySQL default port
            account: process.env.DB_ACCOUNT || 'admin',
            password: DB_PASSWORD
        }
    }

	let model  = ModelSingleton.getInstance()
	await model.initialize(config)
}


main().
catch (error => {
    console.error(`ERROR : Can not start Comaint backend : ${error.message}`)
})
