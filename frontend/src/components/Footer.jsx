import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import '../scss/footer.scss'

const Footer = () => {
	const { t } = useTranslation()
    const [backendVersion, setBackendVersion ]  = useState('?')

    return (
        <footer className="root_footer">
            <ul>
				<li> <Link to="/contact-us">{t('footer.contact_us')}</Link>         </li>
				<li> <Link to="/privacy-policy">{t('footer.privacy_policy')}</Link> </li>
				<li> <Link to="/terms-of-use">{t('footer.terms_of_use')}</Link>     </li>
				<li> <Link to="/about">{t('footer.about_link')}</Link>              </li>
            </ul>
        </footer>
    )
}

export default Footer
