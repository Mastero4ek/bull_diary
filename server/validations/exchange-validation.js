const i18next = require('i18next')

const { EXCHANGES } = require('@helpers/constant-helpers')

const ExchangeValidation = {
	getBybitOrdersPnl: {
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
		start_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.invalid', { lng: req.lng }),
			},
		},
		end_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.invalid', { lng: req.lng }),
			},
		},
	},

	getBybitTickers: {
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
	},

	getBybitWallet: {
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
		start_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.invalid', { lng: req.lng }),
			},
		},
		end_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.invalid', { lng: req.lng }),
			},
		},
	},

	getBybitTransactions: {
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
		start_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.invalid', { lng: req.lng }),
			},
		},
		end_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.invalid', { lng: req.lng }),
			},
		},
	},

	getBybitSavedOrders: {
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
		start_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_time.invalid', { lng: req.lng }),
			},
		},
		end_time: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_time.invalid', { lng: req.lng }),
			},
		},
	},
}

module.exports = ExchangeValidation
