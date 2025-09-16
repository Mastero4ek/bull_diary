const i18next = require('i18next')

const { EXCHANGES } = require('@helpers/constant-helpers')

const AuthValidation = {
	signUp: {
		name: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.string', { lng: req.lng }),
			},
			trim: true,
			isLength: {
				options: { min: 2, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.length', { lng: req.lng }),
			},
		},
		email: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.email.required', { lng: req.lng }),
			},
			isEmail: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.email.invalid', { lng: req.lng }),
			},
			normalizeEmail: true,
		},
		password: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.string', { lng: req.lng }),
			},
			isLength: {
				options: { min: 6, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.length', { lng: req.lng }),
			},
			optional: {
				options: ({ req }) => req.body.source && req.body.source !== 'self',
			},
		},
		confirm_password: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.confirm_password.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.string', { lng: req.lng }),
			},
			isLength: {
				options: { min: 6, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.length', { lng: req.lng }),
			},
			custom: {
				options: (value, { req }) => value === req.body.password,
				errorMessage: (value, { req }) =>
					i18next.t('validation.confirm_password.mismatch', { lng: req.lng }),
			},
			optional: {
				options: ({ req }) => req.body.source && req.body.source !== 'self',
			},
		},
		agreement: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.agreement.required', { lng: req.lng }),
			},
			isBoolean: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.agreement.boolean', { lng: req.lng }),
			},
			custom: {
				options: value => value === true,
				errorMessage: (value, { req }) =>
					i18next.t('validation.agreement.must_agree', { lng: req.lng }),
			},
		},
	},

	signIn: {
		email: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.email.required', { lng: req.lng }),
			},
			isEmail: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.email.invalid', { lng: req.lng }),
			},
			normalizeEmail: true,
		},
		password: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.string', { lng: req.lng }),
			},
			isLength: {
				options: { min: 6, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.password.length', { lng: req.lng }),
			},
		},
	},

	logout: {
		refresh_token: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.refresh_token.required', { lng: req.lng }),
			},
		},
	},

	updateKeys: {
		exchange: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.exchange.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.exchange.string', { lng: req.lng }),
			},
			isIn: {
				options: EXCHANGES,
				errorMessage: (value, { req }) =>
					i18next.t('validation.exchange.invalid', { lng: req.lng }),
			},
		},
		api: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.api.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.api.string', { lng: req.lng }),
			},
		},
		secret: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.secret.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.secret.string', { lng: req.lng }),
			},
		},
	},
}

module.exports = AuthValidation
