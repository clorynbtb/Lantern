/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, ArrowRight, LogIn, UserPlus } from 'lucide-react';

interface GuestAuthPromptProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToAuth: (view: 'login' | 'register') => void;
  action: string;
}

export default function GuestAuthPrompt({ isOpen, onClose, onNavigateToAuth, action }: GuestAuthPromptProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-8 pointer-events-auto relative overflow-hidden">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-amber-500/10 blur-[60px]" />

              {/* Content */}
              <div className="relative z-10 text-center">
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-5">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">Unlock this feature</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                  {action ? `${action} requires an account. ` : ''}
                  Create a free account or sign in to unlock all of Lantern's features.
                </p>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAuth('register');
                    }}
                    className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-lg shadow-amber-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    Create free account
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onNavigateToAuth('login');
                    }}
                    className="w-full py-3 px-4 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    Sign in to your account
                  </button>
                  <button
                    onClick={onClose}
                    className="w-full py-2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer"
                  >
                    Continue browsing as Guest
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
