import React from 'react'
import IconSprite from '@/assets/images/icons-sprites.svg'

export const Icon = React.memo(({ onClickIcon, width, height, id }) => {
	const svgStyle = {
		transition: 'all .15s linear',
		width: `${width}rem`,
		height: `${height}rem`,
	}

	const handleClick = React.useCallback(() => {
		if (onClickIcon) {
			onClickIcon()
		}
	}, [onClickIcon])

	return (
		<svg style={svgStyle} onClick={onClickIcon ? handleClick : undefined}>
			<use href={`${IconSprite}#${id}`}></use>
		</svg>
	)
})
