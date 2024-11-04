import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from "i18next"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faWheelchair } from '@fortawesome/free-solid-svg-icons'

import Logo from './Logo'
import StockButton from './StockButton'
import PopupMenu from './PopupMenu'
import AccessibilityDialog from './AccessibilityDialog'
import { useComaintContext } from '../ComaintContext'
import LoginDialog from './LoginDialog'
import LogoutDialog from './LogoutDialog'

import '../scss/header.scss'

const Header = () => {
    const { t } = useTranslation()
	const [connected, setConnected] = useState(false)
	const [isAccountMenuVisible, setAccountMenuVisible] = useState(false)
	const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
	const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
	const [isAccessibilityDialogOpen, setIsAccessibilityDialogOpen] = useState(false)
    const { comaintContext } = useComaintContext()
    const [ accountLabel, setAccountLabel ] = useState('')

    useEffect( ()=> {
	    setAccountLabel( comaintContext ? comaintContext.email : '')
        setConnected( comaintContext ? comaintContext.connected : false)
    }, [comaintContext])


    const onAccountButtonClick = () => {
        if (connected)
            setAccountMenuVisible(true)
        else
            setIsLoginDialogOpen(true)
    }

	const onLogoutMenuClick = () => {
		setIsLogoutDialogOpen(true)
    }


    const onLoginDialogClose = () => {
		setIsLoginDialogOpen(false)
    }

	const onLogoutDialogResponse = (confirmation) => {
		setIsLogoutDialogOpen(false)
	}

	const onAccessibilityDialogClose = () => {
		setIsAccessibilityDialogOpen(false)
	}

	const onAccessibilityButtonClick = () => {
		setIsAccessibilityDialogOpen(true)
	}

    return (
        <>
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
                <StockButton icon='user' onClick={onAccountButtonClick}/>
			    <span className="userid">{accountLabel}</span>

            </header>
            <PopupMenu isVisible={isAccountMenuVisible} setVisible={setAccountMenuVisible}>
                <div onClick={onLogoutMenuClick}>{t('action.logout')}</div>
            </PopupMenu>
		    <AccessibilityDialog isOpen={isAccessibilityDialogOpen} onClose={onAccessibilityDialogClose} /> 
		    <LoginDialog isOpen={isLoginDialogOpen} onClose={onLoginDialogClose} /> 
		    <LogoutDialog isOpen={isLogoutDialogOpen} onResponse={onLogoutDialogResponse}/>
        </>
    )
}

export default Header
