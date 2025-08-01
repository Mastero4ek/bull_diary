import React, { useMemo } from 'react'

import { useSelector } from 'react-redux'

import avatarDefault from '@/assets/images/general/default_avatar.png'
import { ControlButton } from '@/components/ui/buttons/ControlButton'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { H2 } from '@/components/ui/titles/H2'
import { capitalize } from '@/helpers/functions'

import styles from './styles.module.scss'

export const UserLayout = React.memo(() => {
	const { amount, color } = useSelector(state => state.settings)

	const user = {
		id: 2,
		name: 'Viacheslav Chirkov',
		photo: '',
		level: 'bear',
		score: '98',
		roe: '-1.78',
	}

	const userFields = useMemo(
		() => [
			{
				id: 0,
				name: 'Level',
				value: user?.level,
			},
			{
				id: 1,
				name: 'Score',
				value: user?.score,
			},
			{
				id: 2,
				name: 'Roe',
				value: user?.roe,
			},
		],
		[]
	)

	return (
		<OuterBlock>
			<div className={styles.user_wrapper}>
				<div className={styles.user_avatar}>
					<InnerBlock>
						<img src={user?.cover || avatarDefault} alt='avatar' />
					</InnerBlock>
				</div>

				<div className={styles.user_fields}>
					<div className={styles.user_fields_head}>
						<H2>
							<span>{user?.name}</span>
						</H2>

						<ControlButton
							icon={'challenge'}
							onClick={() => console.log('challenge')}
						/>
					</div>

					<ul>
						{userFields &&
							userFields.length > 0 &&
							userFields.map(field => (
								<li key={field?.id}>
									<RootDesc>
										<span>{field?.name}</span>
									</RootDesc>

									<RootDesc>
										{field?.name === 'Level' ? (
											<>
												<span>{capitalize(field?.value)}</span>
											</>
										) : field?.name === 'Roe' ? (
											<>
												<span
													style={
														color
															? {
																	color: `var(--${
																		field?.value.includes('-') ? 'red' : 'green'
																	})`,
															  }
															: {}
													}
												>
													{amount ? '****' : field?.value}
												</span>{' '}
												<span>%</span>
											</>
										) : (
											<span>{field?.value}</span>
										)}
									</RootDesc>
								</li>
							))}
					</ul>
				</div>
			</div>
		</OuterBlock>
	)
})
