'use strict'

if (import.meta.url === `file://${process.argv[1]}`) {
    console.error('Comaint api-lib can not be run directly')
    process.exit(1)
}

export { default as ComaintBackendApi } from './ComaintBackendApi.js';

