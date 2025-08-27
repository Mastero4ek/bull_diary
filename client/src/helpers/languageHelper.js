import Cookies from 'js-cookie'

export const getLanguage = () => {
	try {
		const store = window.__REDUX_STORE__

		if (store) {
			return (
				store.getState().settings.language || Cookies.get('language') || 'en'
			)
		}
	} catch (e) {
		//
	}

	return Cookies.get('language') || 'en'
}

export const setLanguage = language => {
	try {
		const store = window.__REDUX_STORE__
		if (store) {
			store.dispatch({ type: 'settings/setLanguage', payload: language })
		}
	} catch (e) {
		//
	}

	Cookies.set('language', language)
}
