'use strict'
import assert from 'assert'
import nodeMailer from 'nodemailer' //  TODO remove this

const sleep = (tempo) => {
    return new Promise( (resolve) => {
        setTimeout(() => { resolve(); }, tempo)
    })
}

// TODO remove this function (moved in MailManager)
const sendMail = (mailTo, subject, textBody, htmlBody, conf) => {
    assert(conf !== undefined)
    assert(conf.host !== undefined)
    assert(conf.port !== undefined)
    assert(conf.user !== undefined)
    assert(conf.password !== undefined)
    assert(conf.from !== undefined)

    return new Promise( (resolve, reject) => {
        let transporter = nodeMailer.createTransport({
            host: conf.host,
            port: conf.port,
            secure: false,
            auth: {
                user: conf.user,
                pass: conf.password
            },
            tls: {
                // TODO remove this
                rejectUnauthorized: false
            }
        })
        let mailOptions = {
            from: conf.from,
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

export {
    sleep,
    sendMail
}


