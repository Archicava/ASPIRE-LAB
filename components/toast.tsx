'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';

type Toast = {
  id: string;
  title: string;
  description?: string;
  tone?: 'default' | 'success' | 'danger';
};

type ToastContextValue = {
  show: (toast: Omit<Toast, 'id'>) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, ...toast }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4500);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <aside
        aria-live="assertive"
        className="toast-stack"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="card fade-in toast-card"
            style={{
              padding: '0.9rem 1.1rem',
              borderLeft: `5px solid ${resolveColor(toast.tone)}`
            }}
          >
            <p style={{ margin: 0, fontWeight: 600 }}>{toast.title}</p>
            {toast.description ? (
              <p style={{ margin: '0.4rem 0 0', color: 'var(--color-text-secondary)' }}>
                {toast.description}
              </p>
            ) : null}
          </div>
        ))}
      </aside>
    </ToastContext.Provider>
  );
}

function resolveColor(tone: Toast['tone']) {
  switch (tone) {
    case 'success':
      return 'var(--color-success)';
    case 'danger':
      return 'var(--color-danger)';
    default:
      return 'var(--color-accent)';
  }
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
