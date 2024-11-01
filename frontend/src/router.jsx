import { createBrowserRouter } from "react-router-dom"

import App from './App'
import ErrorPage from './containers/ErrorPage.jsx'
import Home from "./containers/Home"
import About from "./containers/About"
import PrivacyPolicy from "./containers/PrivacyPolicy"
import TermsOfUse from "./containers/TermsOfUse"
import DialogDemo from "./containers/DialogDemo"
import Development from './containers/Development'

const createRouter = () => {
	return createBrowserRouter([
		{
			path: '/',
			element: <App/>,
			errorElement: <ErrorPage />,
			children: [
				{ index:true              , element:<Home/> },
				{ path: '/about'          , element:<About/> },
				{ path: '/privacy-policy' , element:<PrivacyPolicy/> },
				{ path: '/terms-of-use'   , element:<TermsOfUse/> },
				{ path: '/dialog-demo'    , element:<DialogDemo/> },
				{ path: '/dev'            , element:<Development/> }
			]
		}
	])
}

export default createRouter
