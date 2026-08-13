import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto sm:w-96 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-orange-500/95 text-white border-orange-600 shadow-orange-500/20'
              : toast.type === 'warning'
              ? 'bg-amber-500/95 text-white border-amber-600 shadow-amber-500/20'
              : 'bg-stone-800/95 text-white border-stone-700 shadow-stone-900/20'
          }`}
        >
          <div className="mr-3 mt-0.5 shrink-0">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : toast.type === 'warning' ? (
              <AlertTriangle className="w-6 h-6 text-white" />
            ) : (
              <Info className="w-6 h-6 text-white" />
            )}
          </div>
          <div className="flex-1 pr-2">
            <h4 className="font-bold text-base leading-snug">{toast.title}</h4>
            {toast.message && <p className="text-xs text-orange-50 mt-0.5 leading-relaxed">{toast.message}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="閉じる"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
