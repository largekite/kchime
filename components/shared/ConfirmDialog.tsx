'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  destructive = true,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [visible, setVisible] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    cancelRef.current?.focus();
  }, []);

  function handleConfirm() {
    setVisible(false);
    setTimeout(onConfirm, 150);
  }

  function handleCancel() {
    setVisible(false);
    setTimeout(onCancel, 150);
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors duration-150 ${visible ? 'bg-black/30' : 'bg-transparent'}`}
      onClick={handleCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div
        className={`w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl transition-all duration-150 ${visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 mb-4">
          {destructive && (
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
          )}
          <div>
            <h3 id="confirm-title" className="text-base font-semibold text-gray-900">{title}</h3>
            <p id="confirm-message" className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            ref={cancelRef}
            onClick={handleCancel}
            className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 ${
              destructive
                ? 'bg-red-600 hover:bg-red-700 focus:ring-red-200'
                : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-200'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
