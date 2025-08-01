import React, { useState } from 'react'

import { PageLayout } from '@/components/layouts/PageLayout'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { Keys } from './Keys'
import { Tuning } from './Tuning'
import { Loader } from '@/components/ui/general/Loader'

import styles from './styles.module.scss'

export const SettingsPage = React.memo(() => {
	const [changeDesc, setChangeDesc] = useState(false)

	return (
		<PageLayout chartWidth={600} filter={false}>
			{/* <Loader /> */}

			<div style={{ marginBottom: 'auto' }}>
				<div className={styles.settings_wrapper}>
					<Keys handleClickRadio={() => setChangeDesc(!changeDesc)} />
					<Tuning handleClickRadio={() => setChangeDesc(!changeDesc)} />
				</div>
			</div>

			<OuterBlock>
				{!changeDesc ? (
					<DescLayout
						icon={'settings'}
						title={
							<>
								Customize the application <br /> to suit your taste
							</>
						}
						description={
							<>
								Lorem ipsum dolor, sit amet consectetur adipisicing elit. Atque
								illo consequatur magni eos odit perferendis, cumque minus
								obcaecati reiciendis sed. Id in eaque asperiores. Enim autem
								aperiam cumque adipisci tenetur.
							</>
						}
					/>
				) : (
					<DescLayout
						icon={'keys'}
						title={
							<>
								Connect your exchange <br /> using API keys
							</>
						}
						description={
							<>
								Lorem ipsum dolor sit amet consectetur adipisicing elit. Tenetur
								dolorum necessitatibus reiciendis atque corrupti ex, pariatur et
								eum eligendi nihil unde, dolorem eos quasi accusamus cumque enim
								assumenda! Ex, temporibus! Aliquid odit laborum sed molestiae
								quia commodi a neque quas nihil esse recusandae, obcaecati, est
								numquam eligendi voluptas qui quisquam perspiciatis eius nobis
								earum voluptatibus? Dolorem minima laborum architecto fuga?
								Dolorem, itaque eaque? Corrupti, non aperiam eos, doloribus
								saepe praesentium earum sint voluptates dolorum, error ullam
								omnis ipsum ducimus ut! Nihil nesciunt in eius! Quidem, dolorum
								perspiciatis? Nostrum, non beatae? Labore quis eligendi
								voluptatem unde nisi ipsam distinctio hic, odio reprehenderit
								eum iusto optio! Reiciendis architecto ipsa omnis error
								similique ad atque, ea facere fuga nulla, iure, fugiat magni
								explicabo.
							</>
						}
					/>
				)}
			</OuterBlock>
		</PageLayout>
	)
})
