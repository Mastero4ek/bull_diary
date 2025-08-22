import moment from 'moment/min/moment-with-locales';
import { useTranslation } from 'react-i18next';

export const useFormatDuration = () => {
	const { t } = useTranslation()

	const formatDuration = (openTime, closedTime) => {
		if (!openTime || !closedTime) return ''

		const open = moment(openTime)
		const closed = moment(closedTime)
		const duration = moment.duration(closed.diff(open))

		const days = Math.floor(duration.asDays())
		const hours = duration.hours()
		const minutes = duration.minutes()
		const seconds = duration.seconds()

		let result = ''

		if (days > 0) result += `${days}${t('page.position.duration_time_days')} `
		if (hours > 0 || days > 0)
			result += `${hours}${t('page.position.duration_time_hours')} `
		if (minutes > 0 || hours > 0 || days > 0)
			result += `${minutes}${t('page.position.duration_time_minutes')} `
		result += `${seconds}${t('page.position.duration_time_seconds')}`

		return result.trim()
	}

	return formatDuration
}
