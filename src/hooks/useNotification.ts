// src/hooks/useNotification.ts
import { useState, useCallback } from 'react';

type Severity = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  open: boolean;
  msg: string;
  type: Severity;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification>({
    open: false,
    msg: '',
    type: 'success',
  });

  const notify = useCallback((msg: string, type: Severity = 'success') => {
    setNotification({ open: true, msg, type });
  }, []);

  const close = useCallback(() => {
    setNotification((prev) => ({ ...prev, open: false }));
  }, []);

  return { notification, notify, close };
};
