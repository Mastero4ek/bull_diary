import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Autoplay } from 'swiper/modules'

import { usePopup } from '@/components/layouts/PopupLayout/PopupProvider'
import { SignUpPopup } from '@/popups/SignUpPopup'
import { H1 } from '@/components/ui/titles/H1'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { DotList } from '@/components/ui/general/DotList'

import styles from './styles.module.scss'

import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './platform_slider.scss'

export const Platform = () => {
	const platformList = [
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
		{
			id: 5,
			text: 'Interactive Charts',
		},
		{
			id: 6,
			text: 'Add comments to the order',
		},
	]

	const { openPopup } = usePopup()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	return (
		<section id='benefits' className={styles.benefits}>
			<div className={styles.container_wrapper}>
				<div className={styles.benefits_wrapper}>
					<div className={styles.benefits_content}>
						<H1>A feature-packed online Platform</H1>

						<DotList listArr={platformList} />

						<RootButton
							onClickBtn={handleClickSignup}
							text={'Sign up'}
							icon='sign-up'
						/>
					</div>

					<InnerBlock>
						<div className={styles.benefits_slider}>
							<Swiper
								slidesPerView={1}
								spaceBetween={20}
								loop={true}
								pagination={{ clickable: true }}
								autoplay={{ delay: 2500, disableOnInteraction: false }}
								modules={[Pagination, Autoplay]}
								className='mySwiper'
							>
								<SwiperSlide>
									<img src='' alt='DiaryPage-screenshot' />
								</SwiperSlide>

								<SwiperSlide>
									<img src='' alt='TablePage-screenshot' />
								</SwiperSlide>

								<SwiperSlide>
									<img src='' alt='BattlePage-screenshot' />
								</SwiperSlide>

								<SwiperSlide>
									<img src='' alt='ProfilePage-screenshot' />
								</SwiperSlide>
							</Swiper>
						</div>
					</InnerBlock>
				</div>
			</div>
		</section>
	)
}
