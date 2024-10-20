import { Outlet } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import {FlashPopupStack, newFlashPopupStack} from './components/dialog/FlashPopupStack';

import './scss/global.scss'

function App() {
    const flashPopupStack = newFlashPopupStack()
    return (<>
        <Header/>
        <Outlet/>
        <Footer/>
        <FlashPopupStack flashPopupStack={flashPopupStack}/>
    </>)
}

export default App
