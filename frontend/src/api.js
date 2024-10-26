import { ComaintBackendApi } from 'comaint-api-lib'

const apiUrl = window.location.origin
const api = new ComaintBackendApi(apiUrl)

export default api
