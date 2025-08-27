import path from 'path'
import { defineConfig } from 'vite'

import react from '@vitejs/plugin-react'

export default defineConfig({
	plugins: [react()],
	base: '',
	resolve: {
		alias: {
			'@': path.resolve('./', './src'),
		},
	},
	css: {
		preprocessorOptions: {
			scss: {
				api: 'modern-compiler',
			},
		},
	},
	build: {
		sourcemap: true,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					redux: ['react-redux', '@reduxjs/toolkit', 'redux', 'redux-persist'],
					ui: ['react-router-dom', 'react-scroll', 'react-hook-form'],
					charts: ['@nivo/core', '@nivo/line', '@nivo/bar', '@nivo/pie'],
					utils: ['uuid', 'moment', 'lodash', 'crypto-js'],
					internationalization: [
						'i18next',
						'i18next-browser-languagedetector',
						'react-i18next',
					],
					media: ['swiper', 'framer-motion', 'react-countup'],
					forms: [
						'react-calendar',
						'react-date-range',
						'@wojtekmaj/react-daterange-picker',
						'react-phone-input-2',
					],
					network: ['axios', 'socket.io-client'],
					uiComponents: ['react-dropzone', 'react-table', 'react-paginate'],
					imageProcessing: [
						'@hugocxl/react-to-image',
						'use-react-screenshot',
						'image-js',
					],
				},
			},
		},
		minify: 'terser',
		terserOptions: {
			compress: {
				drop_console: true,
				drop_debugger: true,
			},
		},
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'react-redux',
			'@reduxjs/toolkit',
			'react-router-dom',
		],
	},
})
