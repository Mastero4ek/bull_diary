import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.listeners = new Map();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    const serverUrl = import.meta.env.VITE_API_URL?.replace('/api/', '');

    this.socket = io(serverUrl, {
      path: '/api/v1/socket.io',
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyListeners('connection', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      this.notifyListeners('connection', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      this.notifyListeners('error', { error: error.message });
    });

    this.socket.on('positions_update', (data) => {
      this.notifyListeners('positions_update', data);
    });

    this.socket.on('connection_status', (data) => {
      this.notifyListeners('connection_status', data);
    });

    this.socket.on('sync_progress', (data) => {
      this.notifyListeners('sync_progress', data);
    });

    this.socket.on('sync_completed', (data) => {
      this.notifyListeners('sync_completed', data);
    });

    this.socket.on('sync_error', (data) => {
      this.notifyListeners('sync_error', data);
    });

    this.socket.on('sync_cancelled', (data) => {
      this.notifyListeners('sync_cancelled', data);
    });

    this.socket.on('error', (data) => {
      this.notifyListeners('error', data);
    });

    this.socket.on('tournaments_update', (data) => {
      this.notifyListeners('tournaments_update', data);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  subscribeToPositions(userId, exchange) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    this.socket.emit('subscribe_positions', { userId, exchange });
  }

  unsubscribeFromPositions(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_positions', { userId });
    }
  }

  startSync(userId, exchange, start_time, end_time, language = 'en') {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    this.socket.emit('start_sync', {
      userId,
      exchange,
      start_time,
      end_time,
      language,
    });
  }

  getSyncProgress(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_sync_progress', { userId });
    }
  }

  cancelSync(userId, exchange) {
    if (this.socket && this.isConnected) {
      this.socket.emit('cancel_sync', { userId, exchange });

      setTimeout(() => {
        this.disconnect();
      }, 1000);
    }
  }

  getConnectionStatus(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_connection_status', { userId });
    }
  }

  subscribeToTournaments(
    userId,
    exchange,
    page = 1,
    size = 5,
    search = null,
    sort = null,
    language = 'en'
  ) {
    if (!this.socket || !this.isConnected) {
      this.connect();
    }

    this.socket.emit('subscribe_tournaments', {
      userId,
      exchange,
      page,
      size,
      search,
      sort,
      language,
    });
  }

  unsubscribeFromTournaments(userId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('unsubscribe_tournaments', { userId });
    }
  }

  updateTournamentSubscription(userId, params) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_tournament_subscription', { userId, ...params });
    }
  }

  addListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket listener:', error);
        }
      });
    }
  }

  getConnectionState() {
    return this.isConnected;
  }

  getSocket() {
    return this.socket;
  }
}

export default new WebSocketService();
