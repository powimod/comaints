
import { useRouteError, Link } from 'react-router-dom'

import Header from '../components/Header'
import Footer from '../components/Footer'


const ErrorPage = () => {
	const error = useRouteError()
	const message = error ? error.statusText || error.message : 'Unknown error'
	return (<>
		<Header/>
		    <p>{message}</p> 
		<Footer/>
	</>)
}

export default ErrorPage
