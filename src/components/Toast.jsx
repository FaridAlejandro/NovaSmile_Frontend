/**
 * Nova Smile - Componente Toast
 * Muestra notificaciones tipo toast flotantes
 */
import React from 'react';

export default function Toast({ toast, onHide }) {
  if (!toast.visible) return null;

  const bgClass = toast.type === 'success' ? 'text-bg-success' : 'text-bg-danger';

  return (
    <div className="toast-container">
      <div
        className={`toast align-items-center ${bgClass} border-0 show`}
        role="alert"
        aria-live="assertive"
      >
        <div className="d-flex">
          <div className="toast-body fw-bold">{toast.message}</div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={onHide}
            aria-label="Cerrar"
          />
        </div>
      </div>
    </div>
  );
}
