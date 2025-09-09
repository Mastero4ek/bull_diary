import {
  useCallback,
  useEffect,
} from 'react';

import { useTranslation } from 'react-i18next';
import {
  useDispatch,
  useSelector,
} from 'react-redux';

import {
  useNotification,
} from '@/components/layouts/specialized/NotificationLayout/NotificationProvider';
import { updateKeySyncStatus } from '@/redux/slices/candidateSlice';
import { setPositions } from '@/redux/slices/positionsSlice';
import {
  setSyncCancelled,
  setSyncCompleted,
  setSyncError,
  setSyncProgress,
  setSyncReset,
  setSyncStarted,
} from '@/redux/slices/syncSlice';
import { setTournamentsFromWebSocket } from '@/redux/slices/tournamentSlice';
import {
  clearConnectionError,
  setConnectionError,
  setConnectionStatus,
  setConnectionStatusMessage,
  setSubscriptionStatus,
} from '@/redux/slices/websocketSlice';
import WebSocketService from '@/services/WebSocketService';

export const useWebSocket = () => {
  const dispatch = useDispatch();
  const {
    isConnected,
    isSubscribed,
    status: connectionStatus,
    error,
  } = useSelector((state) => state.websocket);

  const { showSuccess, showError } = useNotification();
  const { t } = useTranslation();

  const { data: positions, lastUpdate } = useSelector(
    (state) => state.positions
  );

  const {
    isSynced,
    isSyncing,
    progress: syncProgress,
    status: syncStatus,
    message: syncMessage,
    result: lastSyncResult,
    error: syncError,
  } = useSelector((state) => state.sync);

  const { exchange } = useSelector((state) => state.filters);
  const user = useSelector((state) => state.candidate?.user);
  const { language } = useSelector((state) => state.settings);

  const handleConnection = useCallback(
    (data) => {
      dispatch(setConnectionStatus(data.connected));
      if (data.connected) {
        dispatch(clearConnectionError());
      }
    },
    [dispatch]
  );

  const handlePositionsUpdate = useCallback(
    (data) => {
      dispatch(setPositions(data.positions));
      dispatch(clearConnectionError());
    },
    [dispatch]
  );

  const handleConnectionStatus = useCallback(
    (data) => {
      dispatch(setConnectionStatusMessage(data));
      dispatch(setConnectionStatus(data.connected));
    },
    [dispatch]
  );

  const handleError = useCallback(
    (data) => {
      dispatch(setConnectionError(data.message || 'WebSocket error'));
    },
    [dispatch]
  );

  const handleSyncProgress = useCallback(
    (data) => {
      dispatch(setSyncProgress(data));
    },
    [dispatch]
  );

  const handleSyncCompleted = useCallback(
    (data) => {
      showSuccess(t('sync.completed'));
      dispatch(setSyncCompleted(data));

      if (exchange?.name) {
        dispatch(
          updateKeySyncStatus({ exchange: exchange.name, syncStatus: true })
        );
      }
    },
    [dispatch, exchange?.name, showSuccess, t]
  );

  const handleAutoSyncStarted = useCallback(() => {
    // Auto sync started
  }, []);

  const handleAutoSyncProgress = useCallback(() => {
    // Auto sync progress
  }, []);

  const handleAutoSyncCompleted = useCallback(() => {
    // Auto sync completed
  }, []);

  const handleAutoSyncError = useCallback(() => {
    showError(t('sync.error'));
  }, [showError, t]);

  const handleSyncScheduled = useCallback(() => {
    // Sync scheduled
  }, []);

  const handleSyncError = useCallback(
    (data) => {
      dispatch(setSyncError(data));
      if (exchange?.name) {
        dispatch(
          updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
        );
      }
    },
    [dispatch, exchange?.name]
  );

  const handleSyncCancelled = useCallback(() => {
    dispatch(setSyncCancelled());
    dispatch(setConnectionStatus(false));
    dispatch(setSubscriptionStatus(false));

    if (exchange?.name) {
      dispatch(
        updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
      );
    }
  }, [dispatch, exchange?.name]);

  const handleTournamentsUpdate = useCallback(
    (data) => {
      dispatch(setTournamentsFromWebSocket(data));
      dispatch(clearConnectionError());
    },
    [dispatch]
  );

  const connect = useCallback(() => {
    WebSocketService.connect();
  }, []);

  const disconnect = useCallback(() => {
    WebSocketService.disconnect();
    dispatch(setConnectionStatus(false));
    dispatch(setSubscriptionStatus(false));
  }, [dispatch]);

  const subscribeToPositions = useCallback(() => {
    if (user?.id && exchange?.name) {
      WebSocketService.subscribeToPositions(user.id, exchange.name);
      dispatch(setSubscriptionStatus(true));
    }
  }, [user?.id, exchange?.name, dispatch]);

  const unsubscribeFromPositions = useCallback(() => {
    if (user?.id) {
      WebSocketService.unsubscribeFromPositions(user.id);
      dispatch(setSubscriptionStatus(false));
    }
  }, [user?.id, dispatch]);

  const getConnectionStatus = useCallback(() => {
    if (user?.id) {
      WebSocketService.getConnectionStatus(user.id);
    }
  }, [user?.id]);

  const startDataSync = useCallback(
    (startDate, endDate) => {
      if (user?.id && exchange?.name) {
        dispatch(setSyncStarted());
        dispatch(
          updateKeySyncStatus({ exchange: exchange.name, syncStatus: false })
        );

        WebSocketService.startSync(
          user.id,
          exchange.name,
          startDate,
          endDate,
          language
        );
      }
    },
    [user?.id, exchange?.name, dispatch, language]
  );

  const getSyncProgress = useCallback(() => {
    if (user?.id) {
      WebSocketService.getSyncProgress(user.id);
    }
  }, [user?.id]);

  const cancelSync = useCallback(() => {
    if (user?.id && exchange?.name) {
      WebSocketService.cancelSync(user.id, exchange.name);
    }
  }, [user?.id, exchange?.name]);

  const resetSyncState = useCallback(() => {
    dispatch(setSyncReset());
  }, [dispatch]);

  const subscribeToTournaments = useCallback(() => {
    if (user?.id && exchange?.name) {
      WebSocketService.subscribeToTournaments(
        user.id,
        exchange.name,
        1, // page
        5, // size
        null, // search
        null, // sort
        language
      );
    }
  }, [user?.id, exchange?.name, language]);

  const unsubscribeFromTournaments = useCallback(() => {
    if (user?.id) {
      WebSocketService.unsubscribeFromTournaments(user.id);
    }
  }, [user?.id]);

  const updateTournamentSubscription = useCallback(
    (params) => {
      if (user?.id) {
        WebSocketService.updateTournamentSubscription(user.id, params);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    WebSocketService.addListener('connection', handleConnection);
    WebSocketService.addListener('positions_update', handlePositionsUpdate);
    WebSocketService.addListener('connection_status', handleConnectionStatus);
    WebSocketService.addListener('error', handleError);
    WebSocketService.addListener('sync_progress', handleSyncProgress);
    WebSocketService.addListener('sync_completed', handleSyncCompleted);
    WebSocketService.addListener('sync_error', handleSyncError);
    WebSocketService.addListener('sync_cancelled', handleSyncCancelled);
    WebSocketService.addListener('auto_sync_started', handleAutoSyncStarted);
    WebSocketService.addListener('auto_sync_progress', handleAutoSyncProgress);
    WebSocketService.addListener(
      'auto_sync_completed',
      handleAutoSyncCompleted
    );
    WebSocketService.addListener('auto_sync_error', handleAutoSyncError);
    WebSocketService.addListener('sync_scheduled', handleSyncScheduled);
    WebSocketService.addListener('tournaments_update', handleTournamentsUpdate);

    return () => {
      WebSocketService.removeListener('connection', handleConnection);
      WebSocketService.removeListener(
        'positions_update',
        handlePositionsUpdate
      );
      WebSocketService.removeListener(
        'connection_status',
        handleConnectionStatus
      );
      WebSocketService.removeListener('error', handleError);
      WebSocketService.removeListener('sync_progress', handleSyncProgress);
      WebSocketService.removeListener('sync_completed', handleSyncCompleted);
      WebSocketService.removeListener('sync_error', handleSyncError);
      WebSocketService.removeListener('sync_cancelled', handleSyncCancelled);
      WebSocketService.removeListener(
        'auto_sync_started',
        handleAutoSyncStarted
      );
      WebSocketService.removeListener(
        'auto_sync_progress',
        handleAutoSyncProgress
      );
      WebSocketService.removeListener(
        'auto_sync_completed',
        handleAutoSyncCompleted
      );
      WebSocketService.removeListener('auto_sync_error', handleAutoSyncError);
      WebSocketService.removeListener(
        'tournaments_update',
        handleTournamentsUpdate
      );
      WebSocketService.removeListener('sync_scheduled', handleSyncScheduled);
    };
  }, [
    handleConnection,
    handlePositionsUpdate,
    handleConnectionStatus,
    handleError,
    handleSyncProgress,
    handleSyncCompleted,
    handleSyncError,
    handleSyncCancelled,
    handleAutoSyncStarted,
    handleAutoSyncProgress,
    handleAutoSyncCompleted,
    handleAutoSyncError,
    handleSyncScheduled,
    handleTournamentsUpdate,
  ]);

  return {
    isConnected,
    isSubscribed,
    positions,
    error,
    lastUpdate,
    connectionStatus,
    connect,
    disconnect,
    subscribeToPositions,
    unsubscribeFromPositions,
    subscribeToTournaments,
    unsubscribeFromTournaments,
    updateTournamentSubscription,
    getConnectionStatus,
    isSyncing,
    syncProgress,
    syncStatus,
    syncMessage,
    lastSyncResult,
    syncError,
    startDataSync,
    getSyncProgress,
    cancelSync,
    resetSyncState,
    isSynced,
  };
};
