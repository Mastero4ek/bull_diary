import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Cookies from 'js-cookie';
import { initReactI18next } from 'react-i18next';

import en from './assets/locales/en/translation.json';
import ru from './assets/locales/ru/translation.json';

const resources = {
	en: { translation: en },
	ru: { translation: ru },
}

const lng = Cookies.get('language') || 'en'

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources,
		lng,
		fallbackLng: 'en',
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ['cookie', 'localStorage', 'navigator', 'htmlTag'],
			caches: ['cookie'],
		},
	})

export default i18n
