import '@/styles/app.scss';
import './i18n';

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
  PopupLayout,
} from '@/components/layouts/popups/PopupLayout/PopupLayout';
import {
  PopupProvider,
} from '@/components/layouts/popups/PopupLayout/PopupProvider';
import {
  NotificationProvider,
} from '@/components/layouts/specialized/NotificationLayout';
import { store } from '@/redux/store';

window.__REDUX_STORE__ = store;

const rootElem = document.getElementById('root');

if (rootElem) {
  const root = ReactDOM.createRoot(rootElem);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route
        path="*"
        element={
          <>
            <App />
            <PopupLayout close={true} />
          </>
        }
      />
    ),
    {
      future: {
        v7_startTransition: true,
      },
    }
  );

  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <PopupProvider>
          <NotificationProvider>
            <RouterProvider router={router} />
          </NotificationProvider>
        </PopupProvider>
      </Provider>
    </React.StrictMode>
  );
}
