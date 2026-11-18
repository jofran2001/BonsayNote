import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextData {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextData>({} as ToastContextData);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        removeToast(id);
      }, 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Container de Toasts Mobile-First no topo */}
      <div className="fixed top-4 inset-x-4 z-[100] flex flex-col items-center gap-2 pointer-events-none max-w-md mx-auto">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-fade-in ${
                isSuccess
                  ? 'bg-[#132619]/95 border-[#4ade80]/40 text-stone-100'
                  : isError
                  ? 'bg-[#2a1414]/95 border-red-500/40 text-red-100'
                  : 'bg-[#152018]/95 border-[#c28854]/40 text-stone-100'
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-[#4ade80]" />}
                {isError && <AlertCircle className="w-5 h-5 text-red-400" />}
                {!isSuccess && !isError && <Info className="w-5 h-5 text-[#c28854]" />}
              </div>
              <p className="text-sm font-medium leading-snug flex-1">{toast.message}</p>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-stone-400 hover:text-stone-200 p-0.5"
                aria-label="Fechar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextData {
  return useContext(ToastContext);
}

