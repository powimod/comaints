'use strict'
const BACKEND_VERSION = '0.0.1'

import express from 'express'
import i18next from 'i18next'
import Backend from 'i18next-fs-backend'
import middleware from 'i18next-http-middleware'
import dotenv from 'dotenv'

import MailManagerModel from './MailManager.js'
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
    const env = process.env
    const dbPassword = env.DB_PASSWORD
    if (! dbPassword)
        throw new Error('DB_PASSWORD not defined')
    const tokenSecret = env.TOKEN_SECRET
    if (! tokenSecret)
        throw new Error('TOKEN_SECRET not defined')

    const mailServerPassword = env.MAIL_SERVER_PASSWORD 
    if (! mailServerPassword)
        throw new Error('MAIL_SERVER_PASSWORD not defined')
    const mailServerFrom = env.MAIL_SERVER_FROM
    if (! mailServerFrom)
        throw new Error('MAIL_SERVER_FROM not defined')

    // FIXME env variable values are not checked
    let config = {
        version: BACKEND_VERSION,
        server: {
            port: process.env.PORT || 9101
        },
        database: {
            name: env.DB_NAME || 'comaint',
            host: env.DB_HOST || 'localhost',
            port: env.DB_PORT || 3306, // MySQL default port
            user: env.DB_USER || 'admin',
            retry_interval: env.DB_RETRY_INTERVAL || 10, // seconds
            max_retries: env.DB_MAX_RETRIES || -1, // -1:infinity
            password: dbPassword
        },
        security: {
            tokenSecret: tokenSecret,
            hashSalt: parseInt(env.HASH_SALT) || 10,
            refreshTokenLifespan: parseInt(env.REFRESH_TOKEN_LIFESPAN) || 365, // days
            accessTokenLifespan: parseInt(env.ACCESS_TOKEN_LIFESPAN) || 120, // seconds
            codeValidityPeriod: parseInt(env.CODE_VALIDITY_PERIOD) || 600, // seconds
            maxAuthAttempts: parseInt(env.MAX_AUTH_ATTEMPTS ) || 5
        }
    }
    const mailConfig = {
        host: env.MAIL_SERVER_HOST || 'localhost',
        port: env.MAIL_SERVER_PORT || 25,
        user: env.MAIL_SERVER_USER || 'comaint',
        password: mailServerPassword,
        from: mailServerFrom,
    }

    const mailManager = MailManagerModel.getInstance()
    mailManager.initialize(mailConfig)

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
