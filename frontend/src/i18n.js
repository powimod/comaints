import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import HttpBackend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
.use(HttpBackend)
.use(initReactI18next)
.use(LanguageDetector)
.init({
    ns: [ 'frontend', 'common'],
    defaultNS: 'frontend',
    fallbackLng: 'en',
    detection: {
        order: [ 'localStorage', 'cookie', 'navigator'],
        caches: [ 'localStorage', 'cookie']
    },
    interpolation: {
        escapeValue: false
    },
    backend: {
        loadPath: (lng, ns) => {
            if (ns[0] === 'common')
                return '/locales/{{ns}}/{{lng}}.json'
            return '/locales/{{lng}}.json'
        }
    }
})

export default i18n
