import { useEffect } from 'react'

import { useSelector } from 'react-redux'

import { usePopup } from '@/components/layouts/popups/PopupLayout/PopupProvider'
import { SuccessSignUpPopup } from '@/popups/auth/SuccessSignUpPopup'

import { Advantages } from './Advantages'
import { Intro } from './Intro'
import { Manual } from './Manual'
import { Platform } from './Platform'
import { Precedence } from './Precedence'
import { Question } from './Question'
import { Start } from './Start'

export const HomePage = () => {
	const { user } = useSelector(state => state.candidate)
	const { openPopup } = usePopup()

	useEffect(() => {
		if (!user.is_activated && user?.source !== 'self' && user?.email !== '') {
			setTimeout(() => {
				openPopup(<SuccessSignUpPopup />, { shared: true })
			}, 500)
		}
	}, [user.is_activated, user.source])

	return (
		<>
			<Intro />
			<Manual />
			<Start />
			<Advantages />
			<Platform />
			<Precedence />
			<Question />
		</>
	)
}
