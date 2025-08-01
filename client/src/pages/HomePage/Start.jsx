import { H1 } from '@/components/ui/titles/H1'
import { H4 } from '@/components/ui/titles/H4'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { SignUpPopup } from '@/popups/SignUpPopup'

import styles from './styles.module.scss'

export const Start = () => {
	const { openPopup } = usePopup()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	const stepList = [
		{
			id: 0,
			title: 'Register',
			subtitle: 'Create a profile in less than 2 minutes',
			step: '01',
		},
		{
			id: 1,
			title: 'Add keys',
			subtitle: 'Select an exchange and add keys',
			step: '02',
		},
		{
			id: 2,
			title: 'Analyze',
			subtitle: 'Write comments to orders, analyze your path',
			step: '03',
		},
	]

	return (
		<section className={styles.start}>
			<div className={styles.container_wrapper}>
				<div className={styles.start_wrapper}>
					<div className={styles.start_content}>
						<H1>
							<b>Start today with Bull Diary</b>
						</H1>
					</div>

					<OuterBlock>
						<div className={styles.start_wrap}>
							<ul className={styles.start_list}>
								{stepList &&
									stepList.length > 0 &&
									stepList.map(stepItem => (
										<li key={stepItem.id}>
											<InnerBlock>
												<H4>
													<span>{stepItem.title}</span>
												</H4>

												<RootDesc>
													<span>{stepItem.subtitle}</span>
												</RootDesc>

												<strong>{stepItem.step}</strong>
											</InnerBlock>
										</li>
									))}
							</ul>

							<RootButton
								onClickBtn={handleClickSignup}
								text={'Sign up'}
								icon='sign-up'
							/>
						</div>
					</OuterBlock>
				</div>
			</div>
		</section>
	)
}
