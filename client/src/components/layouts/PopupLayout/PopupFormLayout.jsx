import React, { useCallback } from 'react'

import { useDispatch } from 'react-redux'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { Icon } from '@/components/ui/general/Icon'
import { H1 } from '@/components/ui/titles/H1'
import { setServerStatus } from '@/redux/slices/candidateSlice'

import styles from './styles.module.scss'

export const PopupFormLayout = React.memo(props => {
	const { title, socials, subtitle, children } = props
	const dispatch = useDispatch()

	const handleClickGoogle = useCallback(() => {
		dispatch(setServerStatus('loading'))
		window.open(
			`${import.meta.env.VITE_API_URL.replace('/api', '')}auth/google`,
			'_self'
		)
	}, [dispatch])

	const handleClickGithub = useCallback(() => {
		dispatch(setServerStatus('loading'))
		window.open(
			`${import.meta.env.VITE_API_URL.replace('/api', '')}auth/github`,
			'_self'
		)
	}, [dispatch])

	return (
		<div className={styles.form_wrapper}>
			{title && <H1>{title}</H1>}

			{socials && (
				<ul className={styles.form_socials}>
					<li onClick={handleClickGoogle}>
						<Icon id='g-icon' />
						<span>google</span>
					</li>

					<li onClick={handleClickGithub}>
						<Icon id='git-icon' />
						<span>github</span>
					</li>
				</ul>
			)}

			{subtitle && (
				<RootDesc>
					<span style={{ opacity: '0.5' }}>{subtitle}</span>
				</RootDesc>
			)}

			{children}
		</div>
	)
})
