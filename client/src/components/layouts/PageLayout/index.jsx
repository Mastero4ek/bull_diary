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
		searchOptions,
		onChange,
		total,
		children,
		chartWidth = 0,
		update,
		minDate,
		placeholder,
		searchPlaceholder,
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
							searchOptions={searchOptions}
							onChange={onChange}
							total={total}
							update={update}
							minDate={minDate}
							placeholder={placeholder}
							searchPlaceholder={searchPlaceholder}
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
