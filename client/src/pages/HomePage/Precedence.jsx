import { H1 } from '@/components/ui/titles/H1'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { DotList } from '@/components/ui/general/DotList'

import styles from './styles.module.scss'

export const Precedence = () => {
	const precedenceList = [
		{
			id: 0,
			text: 'Clean & User-Friendly Interface',
		},
		{
			id: 1,
			text: 'Cutting-edge Charting',
		},
		{
			id: 2,
			text: 'Ultra-fast update of orders in the diary',
		},
		{
			id: 3,
			text: 'No download - cross browser compatibility',
		},
		{
			id: 4,
			text: 'Real-time Quotes',
		},
	]
	return (
		<section id='battle' className={styles.precedence}>
			<div className={styles.container_wrapper}>
				<div className={styles.precedence_wrap}>
					<div className={styles.precedence_image}>
						<img src='' alt='Championship-banner' />
					</div>

					<div className={styles.precedence_content}>
						<H1>
							<b>Beat the Best</b>
						</H1>

						<RootDesc>
							<span>
								Lorem ipsum dolor sit amet consectetur adipisicing elit.
								Voluptas repudiandae reprehenderit qui minus sit soluta totam
								accusamus sed, expedita ipsam cum at voluptates itaque debitis
								fuga eveniet officia. Quaerat, ducimus.
							</span>
						</RootDesc>

						<DotList listArr={precedenceList} />
					</div>
				</div>
			</div>
		</section>
	)
}
