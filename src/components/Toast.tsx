import React, { useEffect } from 'react';
import { Check, X, AlertTriangle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  type: ToastType;
  title: string;
  message: string;
  onClose: () => void;
  duration?: number;
}

const toastConfig = {
  success: {
    icon: Check,
    borderColor: 'bg-emerald-500',
    iconBg: 'bg-emerald-500',
  },
  error: {
    icon: X,
    borderColor: 'bg-red-500',
    iconBg: 'bg-red-500',
  },
  warning: {
    icon: AlertTriangle,
    borderColor: 'bg-amber-500',
    iconBg: 'bg-amber-500',
  },
  info: {
    icon: Info,
    borderColor: 'bg-blue-500',
    iconBg: 'bg-blue-500',
  },
};

export function Toast({ type, title, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const config = toastConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 z-50 flex w-full max-w-sm overflow-hidden rounded-lg bg-[#18181B] shadow-lg border border-white/5"
    >
      {/* Colored strip on the left */}
      <div className={cn("w-1.5", config.borderColor)} />

      <div className="flex flex-1 items-start p-4">
        {/* Icon Circle */}
        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", config.iconBg)}>
          <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>

        <div className="ml-4 flex-1">
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-400">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="ml-4 inline-flex shrink-0 text-gray-400 hover:text-white focus:outline-none"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
