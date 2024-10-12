'use strict'
import assert from 'assert'

const sleep = (tempo) => {
    return new Promise( (resolve) => {
        setTimeout(() => { resolve(); }, tempo)
    })
}

export {
    sleep
}


