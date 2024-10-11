'use strict'
import assert from 'assert'
import nodeMailer from 'nodemailer'

class MailManager {

    #host = null
    #port = null
    #user = null
    #password = null
    #from = null

    initialize(mailConfig) {
        const mailServerParameterNames = [ 'host', 'port', 'user', 'password', 'from']
        for (const parameterName of mailServerParameterNames ) {
            if (mailConfig[parameterName] === undefined)
                throw new Error(`Parameter «${parameterName}» not defined in mail server configuration`)
        }
        this.#host = mailConfig.host
        this.#port = mailConfig.port
        this.#user = mailConfig.user
        this.#password = mailConfig.password
        this.#from = mailConfig.from
    }

    sendMail(mailTo, subject, textBody, htmlBody, conf) {
        assert(this.#host !== null)

        return new Promise( (resolve, reject) => {
            let transporter = nodeMailer.createTransport({
                host: this.#host,
                port: this.#port,
                secure: false,
                auth: {
                    user: this.#user,
                    pass: this.#password
                },
                tls: {
                    // TODO remove this
                    rejectUnauthorized: false
                }
            })
            let mailOptions = {
                from: this.#from,
                to: mailTo,
                subject: subject,
                text: textBody, // plain text body
                html: htmlBody
            }
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    reject(error)
                    return
                }
                resolve(`Message ${info.messageId} sent: ${info.response}`)
            })
        })
    }


}

class MailManagerSingleton {

	constructor() {
		throw new Error('Can not instanciate MailManagerSingleton!')
	}

	static getInstance() {
		if (! MailManagerSingleton.instance)
			MailManagerSingleton.instance = new MailManager()
		return MailManagerSingleton.instance
	}
}

export default MailManagerSingleton
