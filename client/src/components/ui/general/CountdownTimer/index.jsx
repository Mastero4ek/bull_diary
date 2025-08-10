import React, { useEffect, useState } from 'react'

import moment from 'moment/min/moment-with-locales'
import { useTranslation } from 'react-i18next'

import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { H4 } from '@/components/ui/titles/H4'

import styles from './styles.module.scss'

export const CountdownTimer = React.memo(({ targetDate }) => {
	const { t } = useTranslation()
	const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate))

	useEffect(() => {
		const timer = setInterval(() => {
			setTimeLeft(calculateTimeLeft(targetDate))
		}, 1000)

		return () => clearInterval(timer)
	}, [targetDate])

	function calculateTimeLeft(targetDate) {
		const now = moment()
		const endDate = moment(targetDate)
		const duration = moment.duration(endDate.diff(now))

		return {
			days: Math.floor(duration.asDays()),
			hours: duration.hours(),
			minutes: duration.minutes(),
			seconds: duration.seconds(),
		}
	}

	const formatTime = time => String(time).padStart(2, '0')

	return (
		<InnerBlock>
			<div className={styles.timer_wrapper}>
				{timeLeft.seconds > 0 ? (
					<>
						<H4>
							<span>{timeLeft.days} days</span>
						</H4>

						<H4>
							<span>
								{formatTime(timeLeft.hours)} : {formatTime(timeLeft.minutes)} :{' '}
								{formatTime(timeLeft.seconds)}
							</span>
						</H4>
					</>
				) : (
					<H4>
						<span>{t('page.battle.is_over')}</span>
					</H4>
				)}
			</div>
		</InnerBlock>
	)
})
