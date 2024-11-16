import { Link } from 'react-router-dom'

import { useComaintContext } from '../ComaintContext'
import CompanyInitialisation from './CompanyInitialisation'

const PrivateHomeContent = () => {
    const { comaintContext } = useComaintContext()

    if (!comaintContext.company)
        return <CompanyInitialisation/>

    return (<>
            <h1>Private home page</h1>
            <ul>
                <li><Link to='/unit'>Units</Link></li>
            </ul>
        </>)
}
export default PrivateHomeContent 
