import i18n from "i18next";
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheelchair } from '@fortawesome/free-solid-svg-icons'

import Logo from './Logo'
import StockButton from './StockButton'

import '../scss/header.scss'


const Header = () => {
    const { t } = useTranslation()

    const onAccessibilityButtonClick = () => {
        console.log('accessibility')
    }

    const onProfileButtonClick = () => {
        console.log("profile")
    }

    return (
        <header className="root_header">
            <Logo/>
            <h1>{t('header_title')}</h1>
            <h2>{t('header_subtitle')}</h2>
            <span className='stock-button'>
                <FontAwesomeIcon className='accessibility-button'
                    icon={faWheelchair} 
                    onClick={onAccessibilityButtonClick} 
                    inverse/>
            </span>
            <StockButton icon='user' onClick={onProfileButtonClick}/>

        </header>
    )
}

export default Header
