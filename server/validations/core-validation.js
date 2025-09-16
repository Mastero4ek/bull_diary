const i18next = require('i18next')

const { EXCHANGES, ROLES } = require('@helpers/constant-helpers')

const CoreValidation = {
	savedOrder: {
		id: {
			in: ['params'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
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
		order: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.order.required', { lng: req.lng }),
			},
			isObject: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.order.object', { lng: req.lng }),
			},
		},
	},

	removedOrder: {
		id: {
			in: ['params'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
		order: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.order.required', { lng: req.lng }),
			},
			isObject: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.order.object', { lng: req.lng }),
			},
		},
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

	addTournamentUser: {
		id: {
			in: ['params'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
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

	createTournament: {
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
		name: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.string', { lng: req.lng }),
			},
			isLength: {
				options: { min: 2, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.name.length', { lng: req.lng }),
			},
		},
		start_date: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_date.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_date.invalid', { lng: req.lng }),
			},
		},
		end_date: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_date.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_date.invalid', { lng: req.lng }),
			},
		},
		registration_date: {
			optional: true,
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.registration_date.invalid', { lng: req.lng }),
			},
		},
	},

	removeTournamentUser: {
		id: {
			in: ['params'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
		userId: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
			isMongoId: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.invalid', { lng: req.lng }),
			},
		},
	},

	removeTournament: {
		id: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
			isMongoId: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.invalid', { lng: req.lng }),
			},
		},
	},

	getTournamentUsersList: {
		id: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
	},

	getUser: {
		id: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
			isMongoId: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.invalid', { lng: req.lng }),
			},
		},
	},

	editUser: {
		name: {
			optional: true,
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
		last_name: {
			optional: true,
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.last_name.string', { lng: req.lng }),
			},
			trim: true,
			isLength: {
				options: { min: 2, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.last_name.length', { lng: req.lng }),
			},
		},
		email: {
			optional: true,
			isEmail: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.email.invalid', { lng: req.lng }),
			},
			normalizeEmail: true,
		},
		password: {
			optional: true,
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

	removeCover: {
		filename: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.filename.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.filename.string', { lng: req.lng }),
			},
			trim: true,
		},
		userId: {
			optional: true,
			isMongoId: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.user_id.invalid', { lng: req.lng }),
			},
		},
	},

	removeUser: {
		id: {
			in: ['params'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.id.required', { lng: req.lng }),
			},
		},
		current_email: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.current_email.required', { lng: req.lng }),
			},
			isEmail: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.current_email.invalid', { lng: req.lng }),
			},
			normalizeEmail: true,
		},
		fill_email: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.fill_email.required', { lng: req.lng }),
			},
			isEmail: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.fill_email.invalid', { lng: req.lng }),
			},
			normalizeEmail: true,
			custom: {
				options: (value, { req }) => value === req.body.current_email,
				errorMessage: (value, { req }) =>
					i18next.t('validation.fill_email.mismatch', { lng: req.lng }),
			},
		},
	},

	getUsers: {
		start_time: {
			in: ['query'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_date.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.start_date.invalid', { lng: req.lng }),
			},
		},
		end_time: {
			in: ['query'],
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_date.required', { lng: req.lng }),
			},
			isISO8601: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.end_date.invalid', { lng: req.lng }),
			},
		},
	},

	createUser: {
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
		last_name: {
			optional: true,
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.last_name.string', { lng: req.lng }),
			},
			trim: true,
			isLength: {
				options: { min: 2, max: 50 },
				errorMessage: (value, { req }) =>
					i18next.t('validation.last_name.length', { lng: req.lng }),
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
		},
		role: {
			exists: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.role.required', { lng: req.lng }),
			},
			isString: {
				errorMessage: (value, { req }) =>
					i18next.t('validation.role.string', { lng: req.lng }),
			},
			custom: {
				options: (value, { req }) => {
					return ROLES?.includes(value) || false
				},
				errorMessage: (value, { req }) => {
					return i18next.t('validation.role.invalid', { lng: req.lng })
				},
			},
		},
	},
}

module.exports = CoreValidation
