import { createBrowserRouter } from "react-router-dom"

import App from './App'
import ErrorPage from './containers/ErrorPage.jsx'
import Home from "./containers/Home"

const createRouter = () => {
	return createBrowserRouter([
		{
			path: '/',
			element: <App/>,
			errorElement: <ErrorPage />,
			children: [
				{ index:true, element:<Home/> }
			]
		}
	])
}

export default createRouter
