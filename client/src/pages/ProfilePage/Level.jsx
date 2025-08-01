import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import CountUp from 'react-countup';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

import bear from '@/assets/images/levels/bear.png';
import bull from '@/assets/images/levels/bull.png';
import hamster from '@/assets/images/levels/hamster.png';
import shark from '@/assets/images/levels/shark.png';
import whale from '@/assets/images/levels/whale.png';
import { RootDesc } from '@/components/ui/descriptions/RootDesc';
import { SmallDesc } from '@/components/ui/descriptions/SmallDesc';
import { ClosedContent } from '@/components/ui/general/ClosedContent';
import { InnerBlock } from '@/components/ui/general/InnerBlock';
import { OuterBlock } from '@/components/ui/general/OuterBlock';

import styles from './styles.module.scss';

export const Level = React.memo(() => {
	const location = useLocation()

	const isAdminContext = location.pathname.includes('/all-users')

	const { user } = useSelector(state =>
		isAdminContext ? state.users : state.candidate
	)

	const [levelValue, setLevelValue] = useState(1)

	const levelActivated = useCallback(() => {
		const hamster = (user?.level?.value / 300) * 100
		const bear = (user?.level?.value / 1000) * 100
		const bull = (user?.level?.value / 3000) * 100
		const shark = (user?.level?.value / 8000) * 100
		const whale = (user?.level?.value / 15000) * 100

		switch (true) {
			case user?.level?.value <= 0:
				return setLevelValue(1)
			case user?.level?.value > 0 && user?.level?.value < 300:
				return setLevelValue(hamster)
			case user?.level?.value >= 300 && user?.level?.value < 1000:
				return setLevelValue(bear)
			case user?.level?.value >= 1000 && user?.level?.value < 3000:
				return setLevelValue(bull)
			case user?.level?.value >= 3000 && user?.level?.value < 8000:
				return setLevelValue(shark)
			case user?.level?.value >= 8000 && user?.level?.value <= 15000:
				return setLevelValue(whale)
			case user?.level?.value > 15000:
				return setLevelValue(100)
		}
	}, [user?.level])

	useEffect(() => {
		levelActivated()
	}, [user?.level])

	const levelIconList = useMemo(
		() => [
			{ id: 0, tooltip: '0 - 299', min: 0, max: 299, icon: hamster },
			{ id: 1, tooltip: '300 - 999', min: 300, max: 999, icon: bear },
			{ id: 2, tooltip: '1000 - 2999', min: 1000, max: 2999, icon: bull },
			{ id: 3, tooltip: '3000 - 7999', min: 3000, max: 7999, icon: shark },
			{ id: 4, tooltip: '8000 - 15000', min: 8000, max: 15000, icon: whale },
		],
		[]
	)

	return (
		<div className={styles.level_wrapper}>
			<ul className={styles.level_list}>
				{levelIconList.map(level => {
					const ItemBlock =
						level.id === 0
							? InnerBlock
							: user?.level?.value >= level.min
							? InnerBlock
							: OuterBlock

					return (
						<li key={level?.id}>
							<ItemBlock>
								<div className={styles.level_item}>
									<img src={level?.icon} alt='level-image' />

									{level.id !== 0 &&
										(!user?.level?.value ||
											user?.level?.value < level?.min) && (
											<ClosedContent width={40} />
										)}

									<div className={styles.level_item_wrap}>
										<i>
											<OuterBlock>
												<SmallDesc>
													<span>{level?.tooltip}</span>
												</SmallDesc>
											</OuterBlock>
										</i>
									</div>
								</div>
							</ItemBlock>
						</li>
					)
				})}
			</ul>

			<div className={styles.controls}>
				<div className={styles.thumb} style={{ left: `${levelValue}%` }}>
					<RootDesc>
						<span>
							<CountUp duration={1.5} end={user?.level?.value} />
						</span>
					</RootDesc>
				</div>

				<div className={styles.custom_range}>
					<InnerBlock>
						<div className={styles.rail}>
							<div
								className={styles.inner_rail}
								style={{ width: `${levelValue}%` }}
							></div>
						</div>
					</InnerBlock>
				</div>
			</div>
		</div>
	)
})
