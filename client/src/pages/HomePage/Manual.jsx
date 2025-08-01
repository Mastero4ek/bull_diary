import { H1 } from '@/components/ui/titles/H1'
import { H4 } from '@/components/ui/titles/H4'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { OuterBlock } from '@/components/ui/general/OuterBlock'

import styles from './styles.module.scss'

export const Manual = () => {
	const manualList = [
		{
			id: 0,
			title: (
				<>
					<b>1.</b> Register and connect keys
				</>
			),
			subtitle:
				'Create an account and enter your API keys. You have the opportunity to connect several accounts from one exchange or accounts from several exchanges at once.',
		},
		{
			id: 1,
			title: (
				<>
					<b>2.</b> Wait for the update
				</>
			),
			subtitle:
				'In your personal account, Diary will download the transactions and save them in your account, this will take a couple of minutes. The data is automatically updated by the service; the trader does not need to worry about this.',
		},
		{
			id: 2,
			title: (
				<>
					<b>3.</b> Find a situation
				</>
			),
			subtitle:
				'Using signals, scripts or trader chat, you can find an idea for a deal. Open and close a sell position.',
		},
		{
			id: 3,
			title: (
				<>
					<b>4.</b> Post a comment
				</>
			),
			subtitle:
				'First, study the transactions on the chart, then evaluate the financial result. Record in the comments why you decided to enter the position, describe your feelings during the transaction.',
		},
		{
			id: 4,
			title: (
				<>
					<b>5.</b> Analyze your trade
				</>
			),
			subtitle:
				'Analyze situations and comments regularly. Analyze the situation to identify mistakes in past actions and prevent their repetition.',
		},
	]

	return (
		<section id='manual' className={styles.manual}>
			<div className={styles.container_wrapper}>
				<div className={styles.manual_wrapper}>
					<div className={styles.manual_image}>
						<img src='' alt='Manual-background-image' />
					</div>

					<div className={styles.manual_wrap}>
						<div className={styles.manual_content}>
							<H1>
								<b>How to Keep a Diary</b>
							</H1>

							<RootDesc>
								<span>
									Conceived by Traders for a Seamless Trading Experience <br />{' '}
									from eager novices to sophisticated professionals.
								</span>
							</RootDesc>
						</div>

						<ul className={styles.manual_list}>
							{manualList &&
								manualList.length > 0 &&
								manualList.map(card => (
									<li key={card.id}>
										<OuterBlock>
											<H4>
												<span>{card.title}</span>
											</H4>

											<RootDesc>
												<span>{card.subtitle}</span>
											</RootDesc>
										</OuterBlock>
									</li>
								))}
						</ul>
					</div>
				</div>
			</div>
		</section>
	)
}
