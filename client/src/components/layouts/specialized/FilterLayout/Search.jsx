import React, { useCallback } from 'react'

import { RootSelect } from '@/components/ui/inputs/RootSelect'

import styles from './styles.module.scss'

export const Search = React.memo(
	({
		inputSearch,
		onChange,
		options = [],
		placeholder = '',
		searchPlaceholder = '',
		iconId = 'search',
		className = '',
		disabled = false,
	}) => {
		const handleSelect = useCallback(
			selectedValue => {
				onChange(selectedValue)
			},
			[onChange]
		)

		return (
			<div className={styles.search}>
				<RootSelect
					options={options}
					value={inputSearch}
					onChange={handleSelect}
					placeholder={placeholder}
					search={true}
					searchPlaceholder={searchPlaceholder}
					arrow={true}
					iconId={iconId}
					className={`${styles.search_select} ${className}`.trim()}
					disabled={disabled}
				/>
			</div>
		)
	}
)
