import { useTranslation } from 'react-i18next'
import { Link, useLoaderData } from 'react-router-dom'

import Logo from '../components/Logo'
import Config from '../Config'

import '../scss/about.scss'

//TODO import { getApiVersion } from '../api/global-api.js'
const getApiVersion = () => {
    return '?'
}

const loader = async () => {
	try {
		const result = await getApiVersion()
		return {backendVersion: result.version}
	}
	catch (error) {
		console.error(error)
		return {backendVersion: '?'}
	}
}

const About = (props) => {
	const { t } = useTranslation()
	const { backendVersion } = useLoaderData()

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
export { loader }
