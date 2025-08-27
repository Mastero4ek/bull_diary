import { useEffect, useState } from 'react'

import { getLazyComponent } from '@/routes/lazyRoutes'

export const useLazyComponent = componentName => {
	const [Component, setComponent] = useState(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		const loadComponent = async () => {
			try {
				setIsLoading(true)
				setError(null)

				const LazyComponent = getLazyComponent(componentName)
				setComponent(() => LazyComponent)
			} catch (err) {
				setError(err)
			} finally {
				setIsLoading(false)
			}
		}

		loadComponent()
	}, [componentName])

	return { Component, isLoading, error }
}

export const usePreloadComponent = componentName => {
	const preload = () => {
		const LazyComponent = getLazyComponent(componentName)

		LazyComponent.preload?.()
	}

	return { preload }
}
