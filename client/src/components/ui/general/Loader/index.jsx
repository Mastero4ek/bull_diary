import React, { useEffect } from 'react'

import { useSelector } from 'react-redux'

import { Logo } from '@/components/ui/general/Logo'

import styles from './styles.module.scss'

export const Loader = React.memo(({ logo = true }) => {
	const { language, isLoadingTheme } = useSelector(state => state.settings)

	useEffect(() => {
		if (isLoadingTheme) {
			const scrollBarWidth =
				window.innerWidth - document.documentElement.clientWidth

			document.body.style.overflow = 'hidden'
			document.body.style.paddingRight = `${scrollBarWidth}rem`

			return () => {
				document.body.style.overflow = ''
				document.body.style.paddingRight = ''
			}
		}
	}, [isLoadingTheme])

	const loaderText = language === 'ru' ? 'Загрузка' : 'Loading'

	return (
		<i
			className={styles.loader}
			style={
				isLoadingTheme ? { backdropFilter: 'blur(40rem) grayscale(100%)' } : {}
			}
		>
			{logo && <Logo desc={false} />}

			<i>
				{loaderText.split('').map((letter, index) => (
					<span key={index}>{letter}</span>
				))}
			</i>
		</i>
	)
})
