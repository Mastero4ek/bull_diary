import { Intro } from './Intro'
import { Manual } from './Manual'
import { Start } from './Start'
import { Advantages } from './Advantages'
import { Platform } from './Platform'
import { Precedence } from './Precedence'
import { Question } from './Question'
import { useEffect } from 'react'
import { SuccessSignUpPopup } from '@/popups/SuccessSignUpPopup'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { useSelector } from 'react-redux'

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
