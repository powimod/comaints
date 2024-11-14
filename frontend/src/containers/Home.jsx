import PublicHomeContent from '../components/PublicHomeContent'
import PrivateHomeContent from '../components/PrivateHomeContent'
import AdminHomeContent from '../components/AdminHomeContent'
import { useComaintContext } from '../ComaintContext'

import '../scss/home.scss'

const Home = (props) => {
    const { comaintContext } = useComaintContext()
    if (comaintContext === null)
        return <></>
	return (
		<main className='page_home'>
            { ! comaintContext.connected ? 
                    <PublicHomeContent/>
                : ( comaintContext.administrator ?  
                    <AdminHomeContent/> 
                    : 
                    <PrivateHomeContent/> 
                )
            }
		</main>
	)
}

export default Home
