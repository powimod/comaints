import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router-dom'

import Logo from '../components/Logo'
import Config from '../Config'
import { useComaintApi } from '../ComaintApi'

import '../scss/about.scss'

const About = (props) => {
	const { t } = useTranslation()
    const { comaintApi } = useComaintApi()

    const [ backendVersion, setBackendVersion ] = useState('-')

    useEffect( () => {
        if (api === null)
            return
        const getApiVersion = async () => {
            try {
                const result = await api.getBackendVersion()
                setBackendVersion(result)
            }
            catch (error) {
                console.error(error)
                setBackendVersion('?')
            }
        }
        getApiVersion()
    }, [api])

	const sendMail = (ev) => {
		ev.preventDefault()
		window.location.href = `mailto:${Config.contact}`
	}

	const navigateWebsite = (ev) => {
		ev.preventDefault()
		window.location.replace(Config.website)
	}

	return (
		<main className="about">
			<h1>{t('about.label')}</h1>
			<Logo/>
			<h2>{t('header_title')}</h2>
			<h3>{t('header_subtitle')}</h3>
			<ul>
                <li>{t('about.website')} : <a href="#" onClick={navigateWebsite}>{Config.website}</a></li>
                <li>{t('about.contact')} : <a href="#" onClick={sendMail}>{Config.contact}</a></li>
                <li>{t('about.frontend_version', {'version': Config.version}) }</li>
                <li>{t('about.backend_version',  {'version': backendVersion ? backendVersion : '...'}) }</li>
			</ul>
			<div> <Link to="/">{t('button.home')}</Link> </div>
		</main>
	)
}

export default About
