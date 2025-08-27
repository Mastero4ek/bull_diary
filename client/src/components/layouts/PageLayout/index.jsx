import React from 'react';

import { useSelector } from 'react-redux';

import { InnerBlock } from '@/components/ui/general/InnerBlock';

import { FilterLayout } from '../FilterLayout';
import styles from './styles.module.scss';

export const PageLayout = props => {
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

	const { isTablet, isMobile } = useSelector(state => state.settings)

	return (
		<div className={styles.page_wrapper}>
			<InnerBlock>
				<div className={styles.page}>
					{!isMobile && !isTablet && filter && (
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
						className={styles.page_content}
						style={
							chartWidth > 0
								? { gridTemplateColumns: `1fr ${chartWidth}rem` }
								: { display: 'flex' }
						}
					>
						{children}
					</div>
				</div>
			</InnerBlock>
		</div>
	)
}
