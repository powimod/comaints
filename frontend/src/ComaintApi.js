import { ComaintBackendApi } from 'comaint-api-lib'

class ComaintBackendApiSingleton {
    static #instance = null

    static getInstance() {

        const accountSerializeCallback = (data) => {
            const accountStorageKey = 'account'
            if (data === undefined) {
                const accountData = localStorage.getItem(accountStorageKey)
                data = JSON.parse(accountData)
                console.log("Serialize function - load account", data)
            } else {
                console.log("Serialize function - save account", data)
                const accountData = JSON.stringify(data)
                localStorage.setItem(accountStorageKey, accountData)
            }
            return data
        }

        if (ComaintBackendApiSingleton.#instance === null) {
            const apiUrl = window.location.origin
            ComaintBackendApiSingleton.#instance = new ComaintBackendApi(apiUrl, accountSerializeCallback)
        }

        return ComaintBackendApiSingleton.#instance
    }
}

export default ComaintBackendApiSingleton 
