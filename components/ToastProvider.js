import { createContext, useContext, useState, useCallback } from 'react';
import ToastContainer from './Toast';

const ToastContext = createContext(null);

let toastIdCounter = 0;

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (toast) => {
      const id = toastIdCounter++;
      const newToast = {
        id,
        type: toast.type || 'info',
        title: toast.title,
        message: toast.message || toast.title,
        duration: toast.duration !== undefined ? toast.duration : 5000, // Default 5 seconds
      };

      setToasts((prev) => [...prev, newToast]);

      return id;
    },
    []
  );

  const showToast = useCallback(
    (type, message, options = {}) => {
      if (typeof message === 'string') {
        return addToast({ type, message, ...options });
      }
      return addToast({ type, ...message });
    },
    [addToast]
  );

  const value = {
    toasts,
    addToast,
    removeToast,
    // Convenience methods
    success: (message, options) => showToast('success', message, options),
    error: (message, options) => showToast('error', message, options),
    warning: (message, options) => showToast('warning', message, options),
    info: (message, options) => showToast('info', message, options),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * useToast Hook
 * Usage:
 * const toast = useToast();
 * toast.success('Operation successful!');
 * toast.error('Something went wrong', { duration: 7000 });
 * toast.info({ title: 'Info', message: 'Details here' });
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastProvider;

