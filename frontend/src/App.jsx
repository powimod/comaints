import { useEffect, useState } from 'react'
import api from './api.js'


function App() {


    const [versionBackend, setVersionBackend ]  = useState('?')

    useEffect( () => {
        const getBackendVersion = async () => {
            const ret = await api.getBackendVersion()
            setVersionBackend( ret.success ? ret.version : ret.message)
        }
        getBackendVersion()
    }, [])

    return (<>
        <h1>Comaint</h1>
        <p>Version : {versionBackend}</p>
    </>)
}

export default App
