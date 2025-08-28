import { useCallback, useEffect, useRef, useState } from 'react'

import { useSelector } from 'react-redux'

export const useSliderScroll = () => {
	const containerRef = useRef(null)
	const [activeIndex, setActiveIndex] = useState(0)
	const scrollTimeoutRef = useRef(null)
	const [itemWidths, setItemWidths] = useState([])
	const [gaps, setGaps] = useState([])
	const { isMobile, isTablet } = useSelector(state => state.settings)

	const updateItemWidths = useCallback(() => {
		if (!containerRef.current) return

		const container = containerRef.current
		const children = Array.from(container.children)

		const widths = children.map(child => {
			const rect = child.getBoundingClientRect()
			const computedStyle = window.getComputedStyle(child)

			const paddingLeft = parseFloat(computedStyle.paddingLeft) || 0
			const paddingRight = parseFloat(computedStyle.paddingRight) || 0
			const borderLeft = parseFloat(computedStyle.borderLeftWidth) || 0
			const borderRight = parseFloat(computedStyle.borderRightWidth) || 0

			const baseWidth = rect.width > 0 ? rect.width : child.offsetWidth
			const totalWidth =
				baseWidth + paddingLeft + paddingRight + borderLeft + borderRight
			const innerElements = child.querySelectorAll(
				'[style*="width"], [class*="width"]'
			)

			let maxInnerWidth = totalWidth

			innerElements.forEach(el => {
				const elRect = el.getBoundingClientRect()

				if (elRect.width > maxInnerWidth) {
					maxInnerWidth = elRect.width
				}
			})

			return Math.max(totalWidth, maxInnerWidth)
		})

		const computedGaps = []

		for (let i = 0; i < children.length - 1; i++) {
			const currentChild = children[i]
			const nextChild = children[i + 1]

			const currentRect = currentChild.getBoundingClientRect()
			const nextRect = nextChild.getBoundingClientRect()

			const gap = nextRect.left - (currentRect.left + currentRect.width)

			computedGaps.push(Math.max(0, gap))
		}

		setItemWidths(widths)
		setGaps(computedGaps)
	}, [])

	const calculatePositionWithGaps = useCallback(
		index => {
			if (itemWidths.length === 0 || index >= itemWidths.length) return 0

			let position = 0

			for (let i = 0; i < index; i++) {
				position += itemWidths[i]

				if (i < gaps.length) {
					position += gaps[i]
				}
			}

			return position
		},
		[itemWidths, gaps]
	)

	const scrollToItem = useCallback(
		index => {
			if (!containerRef.current) return

			const container = containerRef.current
			const containerWidth = container.offsetWidth

			let scrollPosition = 0

			if (itemWidths.length > 0 && index < itemWidths.length) {
				if (index === 0) {
					scrollPosition = 0
				} else if (index === itemWidths.length - 1) {
					const totalWidth =
						calculatePositionWithGaps(itemWidths.length - 1) +
						itemWidths[itemWidths.length - 1]

					scrollPosition = Math.max(0, totalWidth - containerWidth)
				} else {
					const elementStart = calculatePositionWithGaps(index)
					const elementCenter = elementStart + itemWidths[index] / 2

					scrollPosition = elementCenter - containerWidth / 2
				}
			}

			container.scrollTo({
				left: Math.max(0, scrollPosition),
				behavior: 'smooth',
			})

			setActiveIndex(index)
		},
		[itemWidths, gaps, calculatePositionWithGaps]
	)

	const handleScrollWithDebounce = useCallback(() => {
		if (scrollTimeoutRef.current) {
			clearTimeout(scrollTimeoutRef.current)
		}

		scrollTimeoutRef.current = setTimeout(() => {
			if (!containerRef.current) return

			const container = containerRef.current
			const scrollLeft = container.scrollLeft
			const containerWidth = container.offsetWidth

			let centerPosition = scrollLeft + containerWidth / 2
			let nearestIndex = 0
			let minDistance = Infinity

			if (itemWidths.length > 0) {
				let accumulatedWidth = 0

				for (let i = 0; i < itemWidths.length; i++) {
					const elementStart = accumulatedWidth
					const elementCenter = elementStart + itemWidths[i] / 2

					let referencePoint = elementCenter

					if (i === itemWidths.length - 1) {
						referencePoint = elementStart + itemWidths[i] - containerWidth / 2
					}

					const distance = Math.abs(centerPosition - referencePoint)

					if (distance < minDistance) {
						minDistance = distance
						nearestIndex = i
					}

					accumulatedWidth += itemWidths[i]
					if (i < gaps.length) {
						accumulatedWidth += gaps[i]
					}
				}
			}

			let targetScrollPosition = 0

			if (itemWidths.length > 0 && nearestIndex < itemWidths.length) {
				if (nearestIndex === 0) {
					targetScrollPosition = 0
				} else if (nearestIndex === itemWidths.length - 1) {
					const totalWidth =
						calculatePositionWithGaps(itemWidths.length - 1) +
						itemWidths[itemWidths.length - 1]

					targetScrollPosition = Math.max(0, totalWidth - containerWidth)
				} else {
					const elementStart = calculatePositionWithGaps(nearestIndex)
					const elementCenter = elementStart + itemWidths[nearestIndex] / 2

					targetScrollPosition = elementCenter - containerWidth / 2
				}
			}

			container.scrollTo({
				left: Math.max(0, targetScrollPosition),
				behavior: 'smooth',
			})

			setActiveIndex(nearestIndex)
		}, 25)
	}, [itemWidths, gaps, calculatePositionWithGaps])

	useEffect(() => {
		if (containerRef.current && isMobile) {
			const container = containerRef.current
			const parentElement = container.parentElement

			if (parentElement) {
				const leftMask = parentElement.querySelector('.filter_mask_left')
				const rightMask = parentElement.querySelector('.filter_mask_right')

				if (leftMask && rightMask) {
					if (itemWidths.length <= 1) {
						leftMask.style.opacity = '0'
						rightMask.style.opacity = '0'
					} else if (activeIndex === 0) {
						leftMask.style.opacity = '0'
						rightMask.style.opacity = '1'
					} else if (activeIndex === itemWidths.length - 1) {
						leftMask.style.opacity = '1'
						rightMask.style.opacity = '0'
					} else {
						leftMask.style.opacity = '1'
						rightMask.style.opacity = '1'
					}
				}
			}
		}
	}, [activeIndex, itemWidths.length, isMobile])

	useEffect(() => {
		const timer = setTimeout(() => {
			updateItemWidths()
		}, 25)

		return () => clearTimeout(timer)
	}, [updateItemWidths])

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			setTimeout(() => {
				updateItemWidths()
			}, 25)
		})

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current)

			Array.from(containerRef.current.children).forEach(child => {
				resizeObserver.observe(child)
			})
		}

		return () => {
			resizeObserver.disconnect()
		}
	}, [updateItemWidths])

	useEffect(() => {
		return () => {
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current)
			}
		}
	}, [])

	return {
		containerRef,
		activeIndex,
		scrollToItem,
		handleScrollWithDebounce,
		itemWidths,
		gaps,
	}
}
