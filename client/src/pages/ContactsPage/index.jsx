import React from 'react'

import { useTranslation } from 'react-i18next'

import { PageLayout } from '@/components/layouts/PageLayout'
import { DescLayout } from '@/components/layouts/PageLayout/DescLayout'
import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { ContactForm } from '@/components/ui/general/ContactForm'
import { OuterBlock } from '@/components/ui/general/OuterBlock'
import { Socials } from '@/components/ui/general/Socials'

import styles from './styles.module.scss'

export const ContactsPage = React.memo(() => {
	const { t } = useTranslation()

	return (
		<PageLayout chartWidth={600} filter={false}>
			<div className={styles.contacts_wrapper}>
				<OuterBlock>
					<div className={styles.contacts_form}>
						<ContactForm />
					</div>
				</OuterBlock>
			</div>

			<OuterBlock>
				<DescLayout
					icon={'contacts'}
					title={
						<span
							dangerouslySetInnerHTML={{
								__html: t('page.contacts.title'),
							}}
						/>
					}
					description={
						<span
							dangerouslySetInnerHTML={{
								__html: t('page.contacts.description'),
							}}
						/>
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
