import { useComaintContext } from '../ComaintContext'
import CompanyInitialisation from './CompanyInitialisation'

const PrivateHomeContent = () => {
    const { comaintContext } = useComaintContext()

    if (!comaintContext.company)
        return <CompanyInitialisation/>

    return (<>
            <h1>Company initialisation</h1>
        </>)
}
export default PrivateHomeContent 
