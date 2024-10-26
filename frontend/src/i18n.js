import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
.use(HttpBackend)
.use(initReactI18next)
.use(LanguageDetector)
.init({
    backend: {
        loadPath: '/locales/{{lng}}.json'
    },
	fallbackLng: 'en',
	detection: {
		order: [ 'localStorage', 'cookie', 'navigator'],
		caches: [ 'localStorage', 'cookie']
	},
    interpolation: {
        escapeValue: false
    }
})

export default i18n
