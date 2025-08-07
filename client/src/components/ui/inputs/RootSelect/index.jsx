import React, { useCallback, useEffect, useRef, useState } from 'react'

import { RootDesc } from '@/components/ui/descriptions/RootDesc'
import { Icon } from '@/components/ui/general/Icon'
import { InnerBlock } from '@/components/ui/general/InnerBlock'
import { OuterBlock } from '@/components/ui/general/OuterBlock'

import styles from './styles.module.scss'

export const RootSelect = React.memo(
	({
		options = [],
		value,
		onChange,
		iconId,
		placeholder,
		getLabel = option => option.label ?? option,
		getValue = option => option.value ?? option,
		className = '',
		dropdownClassName = '',
		disabled = false,
		children,
	}) => {
		const selectRef = useRef()
		const [open, setOpen] = useState(false)

		const toggleOpen = () => !disabled && setOpen(prev => !prev)

		const handleListItemClick = useCallback(
			item => {
				onChange(getValue(item))
				setOpen(false)
			},
			[onChange, getValue]
		)

		const handleClickOutside = useCallback(e => {
			const path = e.composedPath ? e.composedPath() : e.path

			if (!path.includes(selectRef.current)) {
				setOpen(false)
			}
		}, [])

		useEffect(() => {
			document.body.addEventListener('click', handleClickOutside)

			return () =>
				document.body.removeEventListener('click', handleClickOutside)
		}, [handleClickOutside])

		const ItemBlock = open ? InnerBlock : OuterBlock
		const selectedOption = options.find(opt => getValue(opt) === value)

		return (
			<div ref={selectRef} className={`${styles.select} ${className}`.trim()}>
				<ItemBlock>
					<div
						onClick={toggleOpen}
						className={styles.select_head}
						style={disabled ? { opacity: 0.5, pointerEvents: 'none' } : {}}
					>
						{iconId && <Icon id={iconId} />}

						<RootDesc>
							<span
								style={{
									opacity: placeholder ? 0.5 : 1,
									fontWeight: placeholder ? 600 : 400,
								}}
							>
								{selectedOption ? getLabel(selectedOption) : placeholder}
							</span>
						</RootDesc>
					</div>
				</ItemBlock>

				<ul
					className={
						styles.select_list +
						' ' +
						(open ? styles.select_list_active : '') +
						(dropdownClassName ? ' ' + dropdownClassName : '')
					}
				>
					{options &&
						options.length > 0 &&
						options.map(option => (
							<li
								onClick={() => handleListItemClick(option)}
								key={getValue(option)}
							>
								<RootDesc>
									<span>{getLabel(option)}</span>
								</RootDesc>
							</li>
						))}
				</ul>

				{children && children}
			</div>
		)
	}
)
