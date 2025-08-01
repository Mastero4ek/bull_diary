import { PageLayout } from '@/components/layouts/PageLayout'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ContactForm } from '@/components/ui/general/ContactForm'
import { Socials } from '@/components/ui/general/Socials'
import { Loader } from '@/components/ui/general/Loader'

import React from 'react'

import styles from './styles.module.scss'

export const ContactsPage = React.memo(() => {
	return (
		<PageLayout chartWidth={600} filter={false}>
			<div className={styles.contacts_wrapper}>
				<OuterBlock>
					<div className={styles.contacts_form}>
						{/* <Loader /> */}

						<ContactForm />
					</div>
				</OuterBlock>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'contacts'}
					title={<>Still have questions?</>}
					description={
						<>
							Have a question or require specialist assistance? <br /> Contact
							our dedicated customer service team <br /> who are available 24/7
							to assist you!
							<br />
							<br />
							Please fill out the form, we will be glad to hear your opinion
							<br />
							or write to us on social networks and email!
						</>
					}
				>
					<div className={styles.contacts_desc_bottom}>
						<Socials />

						<RootDesc>
							<a
								className={styles.contacts_desc_link}
								href='mailto:bulldiary@gmail.com'
								target='_blank'
								rel='noopener noreferrer'
							>
								bulldiary@gmail.com
							</a>
						</RootDesc>
					</div>
				</DescLayout>
			</OuterBlock>
		</PageLayout>
	)
})
