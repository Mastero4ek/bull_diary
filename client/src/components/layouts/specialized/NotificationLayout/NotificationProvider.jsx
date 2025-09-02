import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
  return useContext(NotificationContext);
};

export const NotificationProvider = React.memo(({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const showNotification = useCallback(
    (message, type = 'info', duration = 5000) => {
      const id = Date.now() + Math.random();
      const newNotification = {
        id,
        message,
        type, // 'success', 'error', 'warning', 'info'
        duration,
      };

      setNotifications((prev) => [...prev, newNotification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback(
    (message, duration) => showNotification(message, 'success', duration),
    [showNotification]
  );
  const showError = useCallback(
    (message, duration) => showNotification(message, 'error', duration),
    [showNotification]
  );
  const showWarning = useCallback(
    (message, duration) => showNotification(message, 'warning', duration),
    [showNotification]
  );
  const showInfo = useCallback(
    (message, duration) => showNotification(message, 'info', duration),
    [showNotification]
  );

  const contextValue = useMemo(
    () => ({
      notifications,
      showNotification,
      removeNotification,
      clearAllNotifications,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    }),
    [
      notifications,
      showNotification,
      removeNotification,
      clearAllNotifications,
      showSuccess,
      showError,
      showWarning,
      showInfo,
    ]
  );

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
});
