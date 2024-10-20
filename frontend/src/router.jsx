import { createBrowserRouter } from "react-router-dom"

import App from './App'
import ErrorPage from './containers/ErrorPage.jsx'
import Home from "./containers/Home"
import DialogDemo from "./containers/DialogDemo"

const createRouter = () => {
	return createBrowserRouter([
		{
			path: '/',
			element: <App/>,
			errorElement: <ErrorPage />,
			children: [
				{ index:true, element:<Home/> },
				{ path: '/dialog-demo' , element:<DialogDemo/> },
			]
		}
	])
}

export default createRouter
