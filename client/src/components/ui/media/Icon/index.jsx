import React from 'react'

import IconSprite from '@/assets/images/icons-sprites.svg'

export const Icon = React.memo(({ onClickIcon, width, height, id }) => {
	const handleClick = React.useCallback(() => {
		if (onClickIcon) {
			onClickIcon()
		}
	}, [onClickIcon])

	return (
		<svg
			style={{
				transition: 'all .15s linear',
				width: `${width}rem`,
				height: `${height}rem`,
			}}
			onClick={onClickIcon ? handleClick : undefined}
		>
			<use href={`${IconSprite}#${id}`}></use>
		</svg>
	)
})
