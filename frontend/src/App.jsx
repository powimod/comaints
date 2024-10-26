import { Outlet } from 'react-router-dom'

import Header from './components/Header'
import Footer from './components/Footer'

import FlashPopupStack from './components/dialog/FlashPopupStack';
import BubbleMessage from './components/dialog/BubbleMessage';
import StandardDialog from './components/dialog/StandardDialog';

import './scss/global.scss'

function App() {
    return (<>
        <Header/>
        <Outlet/>
        <Footer/>
        <FlashPopupStack/>
        <BubbleMessage/>
        <StandardDialog/>
    </>)
}

export default App
