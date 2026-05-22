'use client';

import { useEffect } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  onClose?: () => void;
  durationMs?: number;
}

export default function Toast({ message, variant = 'default', onClose, durationMs = 3000 }: ToastProps) {
  useEffect(() => {
    if (!onClose) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  return <div className={`toast ${variant}`}>{message}</div>;
}
