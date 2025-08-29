import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'
import './platform_slider.scss'

import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next'
import { Autoplay, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import { usePopup } from '@/components/layouts/popups/PopupLayout/PopupProvider'
import { InnerBlock } from '@/components/layouts/utils/InnerBlock'
import { RootButton } from '@/components/ui/buttons/RootButton'
import { DotList } from '@/components/ui/data/DotList'
import { H1 } from '@/components/ui/typography/titles/H1'
import { SignUpPopup } from '@/popups/auth/SignUpPopup'

import styles from './styles.module.scss'

export const Platform = () => {
	const { t } = useTranslation()

	const platformList = [
		{
			id: 0,
			text: t('page.home.platform.list_1.title'),
		},
		{
			id: 1,
			text: t('page.home.platform.list_2.title'),
		},
		{
			id: 2,
			text: t('page.home.platform.list_3.title'),
		},
		{
			id: 3,
			text: t('page.home.platform.list_4.title'),
		},
		{
			id: 4,
			text: t('page.home.platform.list_5.title'),
		},
		{
			id: 5,
			text: t('page.home.platform.list_6.title'),
		},
		{
			id: 6,
			text: t('page.home.platform.list_7.title'),
		},
	]

	const { openPopup } = usePopup()

	const handleClickSignup = () => {
		openPopup(<SignUpPopup />)
	}

	const contentVariants = {
		hidden: {
			opacity: 0,
			y: 30,
			filter: 'blur(2rem)',
		},
		visible: {
			opacity: 1,
			y: 0,
			filter: 'blur(0rem)',
			transition: {
				duration: 0.6,
				delay: 0.1,
				ease: [0.25, 0.46, 0.45, 0.94],
			},
		},
	};

	return (
		<section id='platform' className={styles.benefits}>
			<div className={styles.container_wrapper}>
				<div className={styles.benefits_wrapper}>
					<motion.div
						className={styles.benefits_content}
						variants={contentVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.3 }}
					>
						<H1>
							<span
								dangerouslySetInnerHTML={{
									__html: t('page.home.platform.title'),
								}}
							/>
						</H1>

						<DotList listArr={platformList} />

						<RootButton
							onClickBtn={handleClickSignup}
							text={t('button.sign_up')}
							icon='sign-up'
						/>
					</motion.div>

					<InnerBlock>
						<div className={styles.benefits_slider}>
							<Swiper
								slidesPerView={1}
								spaceBetween={20}
								loop={true}
								pagination={{ clickable: true }}
								autoplay={{ delay: 2500, disableOnInteraction: false }}
								modules={[Pagination, Autoplay]}
								className='benefits_slider'
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
