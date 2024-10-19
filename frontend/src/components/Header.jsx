import i18n from "i18next";
import { useTranslation } from 'react-i18next';

import Logo from './Logo'

import '../scss/header.scss'


const Header = () => {
    const { t } = useTranslation()

    return (
        <header className="root_header">
            <Logo/>
            <h1>{t('header_title')}</h1>
            <h2>{t('header_subtitle')}</h2>
        </header>
    )
}

export default Header
