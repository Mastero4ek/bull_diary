import React, { Suspense } from 'react'

import { Loader } from '@/components/ui/general/Loader'

export const LazyLoader = ({ children }) => {
	return <Suspense fallback={<Loader />}>{children}</Suspense>
}

export const LazyPage = ({ component: Component, ...props }) => {
	if (!Component) {
		console.error('LazyPage: Component is undefined')
		return <Loader />
	}

	return (
		<Suspense fallback={<Loader />}>
			<Component {...props} />
		</Suspense>
	)
}

export const withLazyLoading = Component => {
	const LazyComponent = props => (
		<Suspense fallback={<Loader />}>
			<Component {...props} />
		</Suspense>
	)

	LazyComponent.displayName = `withLazyLoading(${
		Component.displayName || Component.name
	})`

	return LazyComponent
}
