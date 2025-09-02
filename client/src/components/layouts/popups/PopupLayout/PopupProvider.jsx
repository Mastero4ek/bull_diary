import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import { useDispatch } from 'react-redux';

import { setErrorMessage } from '@/redux/slices/candidateSlice';

const PopupContext = createContext();

export const usePopup = () => {
  return useContext(PopupContext);
};

export const PopupProvider = React.memo(({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [closeButton, setCloseButton] = useState(true);
  const [shared, setShared] = useState(false);
  const [direction, setDirection] = useState('');

  const dispatch = useDispatch();

  const openPopup = useCallback(
    (
      newContent,
      options = { closeButton: true, shared: false, direction: '' }
    ) => {
      setContent(newContent);
      setCloseButton(options.closeButton);
      setShared(options.shared);
      setDirection(options.direction);
      setIsOpen(true);
    },
    []
  );

  const closePopup = useCallback(() => {
    dispatch(setErrorMessage(''));
    setIsOpen(false);
    setContent(null);
    setCloseButton(true);
    setShared(false);
    setDirection('');
  }, [dispatch]);

  const popupContent = useMemo(
    () => ({
      isOpen,
      content,
      closeButton,
      shared,
      direction,
    }),
    [isOpen, content, closeButton, shared, direction]
  );

  const contextValue = useMemo(
    () => ({
      popupContent,
      openPopup,
      closePopup,
    }),
    [popupContent, openPopup, closePopup]
  );

  return (
    <PopupContext.Provider value={contextValue}>
      {children}
    </PopupContext.Provider>
  );
});
