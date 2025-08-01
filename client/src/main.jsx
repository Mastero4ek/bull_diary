import '@/styles/app.scss';

import React from 'react';

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';

import { App } from '@/components/App';
import {
  NotificationLayout,
  NotificationProvider,
} from '@/components/layouts/NotificationLayout';
import { PopupLayout } from '@/components/layouts/PopupLayout/PopupLayout';
import { PopupProvider } from '@/components/layouts/PopupLayout/PopupProvider';
import { store } from '@/redux/store';

const rootElem = document.getElementById('root')

if (rootElem) {
	const root = ReactDOM.createRoot(rootElem)

	const router = createBrowserRouter(
		createRoutesFromElements(
			<Route
				path='*'
				element={
					<>
						<App />

						<PopupLayout close={true} />
					</>
				}
			/>
		)
	)

	root.render(
		<React.StrictMode>
			<Provider store={store}>
				<PopupProvider>
					<NotificationProvider>
						<RouterProvider router={router} />

						<NotificationLayout />
					</NotificationProvider>
				</PopupProvider>
			</Provider>
		</React.StrictMode>
	)
}
