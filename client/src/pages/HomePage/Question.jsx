import { Icon } from '@/components/ui/general/Icon'
import { H1 } from '@/components/ui/titles/H1'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ContactForm } from '@/components/ui/general/ContactForm'
import { InnerBlock } from '@/components/ui/general/InnerBlock'

import styles from './styles.module.scss'

export const Question = () => {
	return (
		<section id='contacts' className={styles.question}>
			<div className={styles.container_wrapper}>
				<div className={styles.question_wrap}>
					<div className={styles.question_content}>
						<H1>
							<b>Still have Questions</b>
						</H1>

						<RootDesc>
							<span>
								Have a question or require specialist assistance? <br /> Contact
								our dedicated customer service team <br /> who are available
								24/7 to assist you!
								<br />
								<br />
								Please fill out the form, we will be glad to hear your opinion
								<br />
								or write to us on email!
							</span>
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
