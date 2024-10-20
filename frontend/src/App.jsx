import { Outlet } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import FlashPopupStack from './components/dialog/FlashPopupStack';

import './scss/global.scss'

function App() {
    return (<>
        <Header/>
        <Outlet/>
        <Footer/>
        <FlashPopupStack/>
    </>)
}

export default App
