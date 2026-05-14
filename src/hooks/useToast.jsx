/**
 * Nova Smile - Hook de Toast/Notificaciones
 */
import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'danger' });

  const showToast = useCallback((message, type = 'danger') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500);
  }, []);

  const hideToast = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  return { toast, showToast, hideToast };
}
