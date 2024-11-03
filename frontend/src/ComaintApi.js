import { ComaintBackendApi } from 'comaint-api-lib'

class ComaintBackendApiSingleton {
    static #instance = null

    static getInstance() {

        const accountSerializeCallback = (data) => {
            const accountStorageKey = 'account'
            if (data === undefined) {
                const accountData = localStorage.getItem(accountStorageKey)
                data = JSON.parse(accountData)
            } else {
                const accountData = JSON.stringify(data)
                localStorage.setItem(accountStorageKey, accountData)
            }
            return data
        }

        if (ComaintBackendApiSingleton.#instance === null) {
            const apiUrl = window.location.origin
            ComaintBackendApiSingleton.#instance = new ComaintBackendApi(apiUrl)
            ComaintBackendApiSingleton.#instance.setAccountSerializeCallback(accountSerializeCallback)
        }

        return ComaintBackendApiSingleton.#instance
    }
}

export default ComaintBackendApiSingleton 
