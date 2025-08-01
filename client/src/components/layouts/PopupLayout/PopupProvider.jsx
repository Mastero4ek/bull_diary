import React, {
  createContext,
  useContext,
  useState,
} from 'react';

import { useDispatch } from 'react-redux';

import { setErrorMessage } from '@/redux/slices/candidateSlice';

const PopupContext = createContext()

export const usePopup = () => {
	return useContext(PopupContext)
}

export const PopupProvider = React.memo(({ children }) => {
	const [popupContent, setPopupContent] = useState({
		content: null,
		closeButton: true,
		shared: false,
	})

	const dispatch = useDispatch()

	const openPopup = (
		content,
		options = { closeButton: true, shared: false }
	) => {
		setPopupContent({
			content,
			closeButton: options.closeButton,
			shared: options.shared,
		})
	}

	const closePopup = () => {
		dispatch(setErrorMessage(''))
		setPopupContent({ content: null, closeButton: true, shared: false })
	}

	return (
		<PopupContext.Provider value={{ popupContent, openPopup, closePopup }}>
			{children}
		</PopupContext.Provider>
	)
})
