import { H1 } from '@/components/ui/titles/H1'
import { H4 } from '@/components/ui/titles/H4'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { Icon } from '@/components/ui/general/Icon'

import styles from './styles.module.scss'

export const Advantages = () => {
	const advantagesList = [
		{
			id: 0,
			iconId: 'protections-keys',
			title: 'Read-only keys',
			subtitle:
				"The diary uses 'read-only' keys. Transactions using such keys are prohibited.",
		},
		{
			id: 1,
			iconId: 'save-history',
			title: (
				<>
					Keeps <br /> history
				</>
			),
			subtitle:
				'Upload transaction information to your account. The transaction archive will be securely stored in one place.',
		},
		{
			id: 2,
			iconId: 'econom-clock',
			title: (
				<>
					Saves <br /> time
				</>
			),
			subtitle:
				"Automatically marks trades on the chart. You don't need to waste time 'manually' transferring trades or calculating trades in Excel.",
		},
		{
			id: 3,
			iconId: 'people-shared',
			title: 'Share your strategy',
			subtitle:
				'With Traders Diary, you can share statistics and trades with other people by creating detailed screenshots.',
		},
		{
			id: 4,
			iconId: 'deleted-user',
			title: 'Complete delete',
			subtitle:
				'Your Diary account can be deleted at any time. The deletion is irreversible and the data will be deleted from the project server.',
		},
	]

	return (
		<section id='why' className={styles.advantages}>
			<div className={styles.container_wrapper}>
				<div className={styles.advantages_wrap}>
					<div className={styles.advantages_image}>
						<img src='' alt='Advantages-background-image' />
					</div>

					<div className={styles.advantages_content}>
						<H1>
							<b>Why traders choose us?</b>
						</H1>

						<RootDesc>
							<span>
								Join the 100,000 users who have already chosen Traders Diary as
								their support platform!
							</span>
						</RootDesc>
					</div>
				</div>

				<OuterBlock>
					<ul className={styles.advantages_list}>
						{advantagesList &&
							advantagesList.length > 0 &&
							advantagesList.map(card => (
								<li key={card.id}>
									<InnerBlock>
										<Icon id={card.iconId} />

										<div>
											<H4>
												<span>{card.title}</span>
											</H4>

											<SmallDesc>
												<span>{card.subtitle}</span>
											</SmallDesc>
										</div>
									</InnerBlock>
								</li>
							))}
					</ul>
				</OuterBlock>
			</div>
		</section>
	)
}
