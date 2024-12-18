import { createBrowserRouter } from "react-router-dom";

import App from './App';
import ErrorPage from './containers/ErrorPage';
import Home from "./containers/Home";
import AdminUserPage from "./containers/AdminUserPage";
import UnitPage from "./containers/UnitPage";
import ForgottenPasswordPage from './containers/ForgottenPasswordPage';
import About from "./containers/About";
import ContactUs from "./containers/ContactUs";
import PrivacyPolicy from "./containers/PrivacyPolicy";
import TermsOfUse from "./containers/TermsOfUse";
import DialogDemo from "./containers/DialogDemo";
import Development from './containers/Development';

const createRouter = () => {
    return createBrowserRouter([
        {
            path: '/',
            element: <App/>,
            errorElement: <ErrorPage />,
            children: [
                { index:true                 , element:<Home/> },
                { path: '/admin/users'       , element:<AdminUserPage/> },
                { path: '/admin/users/:id'   , element:<AdminUserPage/> },
                { path: '/units/:id'         , element:<UnitPage/> },
                { path: '/units'             , element:<UnitPage/> },
                { path: '/forgotten-password', element:<ForgottenPasswordPage/> },
                { path: '/about'             , element:<About/> },
                { path: '/contact-us'        , element:<ContactUs/> },
                { path: '/privacy-policy'    , element:<PrivacyPolicy/> },
                { path: '/terms-of-use'      , element:<TermsOfUse/> },
                { path: '/dialog-demo'       , element:<DialogDemo/> },
                { path: '/dev'               , element:<Development/> }
            ]
        }
    ]);
};

export default createRouter;
