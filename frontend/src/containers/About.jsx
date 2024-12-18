import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLoaderData } from 'react-router-dom';

import Logo from '../components/Logo';
import Config from '../Config';
import ComaintBackendApiSingleton from '../ComaintApi';

import '../scss/about.scss';

const About = () => {
	const { t } = useTranslation();
    const comaintApi = ComaintBackendApiSingleton.getInstance();
    const [ backendVersion, setBackendVersion ] = useState('-');

    useEffect( () => {
        if (comaintApi === null)
            return;
        const getApiVersion = async () => {
            try {
                const result = await comaintApi.getBackendVersion();
                setBackendVersion(result);
            }
            catch (error) {
                console.error(error);
                setBackendVersion('?');
            }
        };
        getApiVersion();
    }, [comaintApi]);

	const sendMail = (ev) => {
		ev.preventDefault();
		window.location.href = `mailto:${Config.contact}`;
	};

	const navigateWebsite = (ev) => {
		ev.preventDefault();
		window.location.replace(Config.website);
	};

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
	);
};

export default About;
