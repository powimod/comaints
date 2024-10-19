import { useEffect, useState } from 'react'
import api from '../api.js'

import '../scss/footer.scss'

const Footer = () => {

    const [backendVersion, setBackendVersion ]  = useState('?')

    useEffect( () => {
        const getBackendVersion = async () => {
            const ret = await api.getBackendVersion()
            setBackendVersion( ret.success ? ret.version : ret.message)
        }
        getBackendVersion()
    }, [])

    return (
        <footer className="root_footer">
            Backend version : {backendVersion}
        </footer>
    )
}

export default Footer
