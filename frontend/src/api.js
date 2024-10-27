import { ComaintBackendApi } from 'comaint-api-lib'

const accountSerializeFunction = (data) => {
    const accountStorageKey = 'account'
    if (data === undefined) {
        // load account from local storage
        const accountData = localStorage.getItem(accountStorageKey)
        data = JSON.parse(accountData)
    }
    else {
        // save account to local storage
        const accountData = JSON.stringify(data)
        localStorage.setItem(accountStorageKey, accountData)
    }
    return data
}



const apiUrl = window.location.origin
const api = new ComaintBackendApi(apiUrl, accountSerializeFunction)

export default api
