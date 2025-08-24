import { useTranslation } from 'react-i18next'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ContactForm } from '@/components/ui/general/ContactForm'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { H1 } from '@/components/ui/titles/H1'

import styles from './styles.module.scss'

export const Question = () => {
	const { t } = useTranslation()

	return (
		<section id='contacts' className={styles.question}>
			<div className={styles.container_wrapper}>
				<div className={styles.question_wrap}>
					<div className={styles.question_content}>
						<H1>
							<b
								dangerouslySetInnerHTML={{
									__html: t('page.home.question.title'),
								}}
							/>
						</H1>

						<RootDesc>
							<span
								dangerouslySetInnerHTML={{
									__html: t('page.home.question.subtitle'),
								}}
							/>
						</RootDesc>

						<RootDesc>
							<a
								className={styles.question_link}
								href='mailto:bulldiary@gmail.com'
								target='_blank'
								rel='noopener noreferrer'
							>
								bulldiary@gmail.com
							</a>
						</RootDesc>
					</div>

					<InnerBlock>
						<div className={styles.question_form}>
							<ContactForm />
						</div>
					</InnerBlock>
				</div>
			</div>
		</section>
	)
}
