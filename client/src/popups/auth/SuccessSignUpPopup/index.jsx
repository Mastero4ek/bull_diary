import React from 'react'

import { useSelector } from 'react-redux'

import { PopupDescLayout } from '@/components/layouts/popups/PopupLayout/PopupDescLayout'
import { PopupFormLayout } from '@/components/layouts/popups/PopupLayout/PopupFormLayout'

export const SuccessSignUpPopup = React.memo(() => {
	const { user } = useSelector(state => state.candidate)

	return (
		<>
			<PopupDescLayout
				title={'Congratulation!'}
				text={
					<>
						You have successfully registered on the platform!
						<br />
						<br />A letter with a registration confirmation link has been sent
						<br />
						to Your email address <b>&quot;{user?.email}&quot;</b> specified
						during registration.
						<br />
					</>
				}
			/>

			<PopupFormLayout subtitle={'The email may have ended up in spam.'} />
		</>
	)
})
