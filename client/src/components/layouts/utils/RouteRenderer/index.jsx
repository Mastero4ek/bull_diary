import { Navigate, Route, Routes } from 'react-router-dom'

import { LazyPage } from '../LazyLoader'

export const RouteRenderer = ({ routes }) => {
	return (
		<Routes>
			{routes.map((route, index) => {
				if (route.redirect) {
					return (
						<Route
							key={`${route.path}-${index}`}
							path={route.path}
							element={<Navigate to={route.redirect} replace />}
						/>
					)
				}

				if (route.component) {
					return (
						<Route
							key={`${route.path}-${index}`}
							path={route.path}
							element={<LazyPage component={route.component} />}
						/>
					)
				}

				return null
			})}
		</Routes>
	)
}
