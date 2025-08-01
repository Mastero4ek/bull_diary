import React from 'react'

import { InnerBlock } from '@/components/ui/general/InnerBlock'

import { FilterLayout } from '../FilterLayout'
import styles from './styles.module.scss'

export const PageLayout = React.memo(props => {
	const {
		filter = true,
		disabled = false,
		periods,
		entries,
		calendar,
		search,
		total,
		children,
		chartWidth = 0,
		update,
		minDate,
	} = props

	return (
		<div className={styles.page_wrapper}>
			<InnerBlock>
				<div className={styles.page}>
					{filter && (
						<FilterLayout
							disabled={disabled}
							periods={periods}
							entries={entries}
							calendar={calendar}
							search={search}
							total={total}
							update={update}
							minDate={minDate}
						/>
					)}

					<div
						style={
							chartWidth > 0
								? { gridTemplateColumns: `1fr ${chartWidth}rem` }
								: { display: 'flex' }
						}
						className={styles.page_content}
					>
						{children}
					</div>
				</div>
			</InnerBlock>
		</div>
	)
})
