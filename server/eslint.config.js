const js = require('@eslint/js')
const globals = require('globals')

module.exports = [
	{ ignores: ['node_modules', 'uploads', 'logs', 'backups'] },
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: {
				...globals.node,
				...globals.commonjs,
			},
			parserOptions: {
				ecmaVersion: 'latest',
				sourceType: 'commonjs',
			},
		},
		plugins: {
			import: require('eslint-plugin-import'),
		},
		rules: {
			...js.configs.recommended.rules,
			'no-unused-vars': 'warn',
			'no-undef': 'error',
			'no-console': 'warn',
			'prefer-const': 'error',
			'no-var': 'error',
			'object-shorthand': 'error',
			'prefer-template': 'error',
			'import/order': [
				'error',
				{
					groups: [
						'builtin',
						'external',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'newlines-between': 'always',
					alphabetize: {
						order: 'asc',
						caseInsensitive: true,
					},
					pathGroups: [
						{
							pattern: '@**',
							group: 'internal',
							position: 'before',
						},
					],
					pathGroupsExcludedImportTypes: ['builtin'],
				},
			],
		},
		settings: {
			'import/resolver': {
				alias: {
					map: [
						['@', '.'],
						['@configs', './configs'],
						['@controllers', './controllers'],
						['@dtos', './dtos'],
						['@exceptions', './exceptions'],
						['@helpers', './helpers'],
						['@locales', './locales'],
						['@mails', './mails'],
						['@middlewares', './middlewares'],
						['@models', './models'],
						['@passports', './passports'],
						['@routers', './routers'],
						['@services', './services'],
						['@validation', './validation'],
					],
					extensions: ['.js'],
				},
			},
		},
	},
]
