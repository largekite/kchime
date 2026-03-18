'use client';

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import clsx from 'clsx';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const ICONS: Record<ToastType, typeof Check> = {
  success: Check,
  error: X,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastType, string> = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  warning: 'bg-amber-600',
  info: 'bg-teal-600',
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const Icon = ICONS[toast.type];
  const innerTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const timer = setTimeout(() => {
      setVisible(false);
      innerTimer.current = setTimeout(() => onRemove(toast.id), 200);
    }, 4000);
    return () => {
      clearTimeout(timer);
      clearTimeout(innerTimer.current);
    };
  }, [toast.id, onRemove]);

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all duration-200',
        STYLES[toast.type],
        visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      )}
    >
      <Icon className="h-4 w-4 flex-shrink-0" />
      <span>{toast.message}</span>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col-reverse items-center gap-2 md:bottom-6">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
