import CountUp from 'react-countup'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { H2 } from '@/components/ui/titles/H2'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { InnerBlock } from '@/components/ui/general/InnerBlock'

import styles from './styles.module.scss'

export const Counts = () => {
	const countsList = [
		{
			id: 0,
			countEnd: 1745,
			text: 'registered users',
		},
		{
			id: 1,
			countEnd: 2698,
			text: 'deposits saved',
		},
		{
			id: 2,
			countEnd: 1002,
			text: 'users use',
		},
		{
			id: 3,
			countEnd: 17,
			text: 'tournaments held',
		},
	]

	return (
		<OuterBlock>
			<ul className={styles.counts}>
				{countsList &&
					countsList.length > 0 &&
					countsList.map(count => (
						<li key={count.id}>
							<InnerBlock>
								<H2>
									<CountUp duration={3} end={count.countEnd} />+
								</H2>

								<RootDesc>
									<span>{count.text}</span>
								</RootDesc>
							</InnerBlock>
						</li>
					))}

				<li>
					<InnerBlock>
						<H2>24/7</H2>

						<RootDesc>
							<span>client support</span>
						</RootDesc>
					</InnerBlock>
				</li>
			</ul>
		</OuterBlock>
	)
}
