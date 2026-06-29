/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  messages: ToastMessage[];
  onClose: (id: string) => void;
}

export default function Toast({ messages, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0" id="toast-wrapper">
      <AnimatePresence>
        {messages.map((msg) => (
          <ToastItem key={msg.id} msg={msg} onClose={onClose} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ msg, onClose }: { msg: ToastMessage; onClose: (id: string) => void; key?: string }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(msg.id);
    }, 4500);
    return () => clearTimeout(timer);
  }, [msg.id, onClose]);

  const isSuccess = msg.type === 'success';
  const isError = msg.type === 'error';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`flex items-start gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
        isSuccess
          ? 'bg-emerald-50/90 dark:bg-emerald-950/80 border-emerald-200/50 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-200'
          : isError
          ? 'bg-rose-50/90 dark:bg-rose-950/80 border-rose-200/50 dark:border-rose-800/30 text-rose-800 dark:text-rose-200'
          : 'bg-neutral-50/90 dark:bg-neutral-900/80 border-neutral-200/50 dark:border-neutral-800/30 text-neutral-800 dark:text-neutral-200'
      }`}
      id={`toast-${msg.id}`}
    >
      <div className="flex-shrink-0 mt-0.5">
        {isSuccess ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400 animate-bounce" />
        ) : isError ? (
          <AlertTriangle className="h-5 w-5 text-rose-500 dark:text-rose-400" />
        ) : (
          <div className="h-5 w-5 rounded-full bg-amber-500" />
        )}
      </div>
      
      <div className="flex-grow text-sm font-medium tracking-wide">
        {msg.text}
      </div>

      <button
        onClick={() => onClose(msg.id)}
        className="flex-shrink-0 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        aria-label="Close alert"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
