import { useTranslation } from 'react-i18next'

export const usePeriods = () => {
	const { t } = useTranslation()

	const PERIODS = [
		{ name: t('filter.period.week'), id: 0, value: 'week' },
		{ name: t('filter.period.month'), id: 1, value: 'month' },
		{ name: t('filter.period.quarter'), id: 2, value: 'quarter' },
		{ name: t('filter.period.year'), id: 3, value: 'year' },
	]

	return { PERIODS }
}
