import React from 'react'

import { useTranslation } from 'react-i18next'

import { PageLayout } from '@/components/layouts/core/PageLayout'
import { DescLayout } from '@/components/layouts/core/PageLayout/DescLayout'
import { OuterBlock } from '@/components/layouts/utils/OuterBlock'
import { ContactForm } from '@/components/ui/forms/ContactForm'
import { Socials } from '@/components/ui/forms/Socials'
import { RootDesc } from '@/components/ui/typography/descriptions/RootDesc'

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
