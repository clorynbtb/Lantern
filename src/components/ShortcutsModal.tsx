/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { X, Keyboard, Circle as HelpCircle, CornerDownLeft } from 'lucide-react';

interface ShortcutsModalProps {
  onClose: () => void;
}

export default function ShortcutsModal({ onClose }: ShortcutsModalProps) {
  const shortcutGroups = [
    {
      title: "Navigation",
      items: [
        { keys: ["1", "F"], desc: "Switch to Home Feed" },
        { keys: ["2", "E"], desc: "Switch to Explore" },
        { keys: ["5", "C"], desc: "Switch to Communities" },
        { keys: ["3", "M"], desc: "Open Direct Messages" },
        { keys: ["4", "P"], desc: "Go to My Profile" },
      ]
    },
    {
      title: "Reading & Writing",
      items: [
        { keys: ["Click Post text"], desc: "Enter Mindful Zen Reading view" },
        { keys: ["A", "+"], desc: "Increase font size in Zen mode" },
        { keys: ["A", "-"], desc: "Decrease font size in Zen mode" },
        { keys: ["Draft Auto-save"], desc: "Your post drafts are saved instantly" }
      ]
    },
    {
      title: "Preferences & Overlays",
      items: [
        { keys: ["T"], desc: "Cycle through aesthetic themes" },
        { keys: ["?"], desc: "Toggle this Shortcuts panel" },
        { keys: ["Esc"], desc: "Close any active modal or menu" }
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 bg-neutral-950/45 dark:bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center p-4 select-none"
      id="shortcuts-modal-overlay"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-lg rounded-3xl bg-theme-card border border-theme-border shadow-2xl overflow-hidden text-left"
        id="shortcuts-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header banner */}
        <div className="p-6 border-b border-theme-border flex items-center justify-between bg-theme-secondary/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
              <Keyboard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-theme-text">Mindful Shortcuts</h3>
              <p className="text-xs text-theme-muted">Personalize your Lantern flow with keyboard commands</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-theme-secondary/20 rounded-xl text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Shortcuts list container */}
        <div className="p-6 space-y-6 max-h-[380px] overflow-y-auto custom-scrollbar">
          {shortcutGroups.map((group) => (
            <div key={group.title} className="space-y-3">
              <h4 className="text-[10px] font-bold text-theme-muted uppercase tracking-wider pl-1">{group.title}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-2xl border border-theme-border bg-theme-secondary/5 text-xs text-theme-text"
                  >
                    <span className="text-theme-muted font-medium pr-2 text-[11px] leading-relaxed">{item.desc}</span>
                    <div className="flex gap-1 flex-shrink-0 select-none">
                      {item.keys.map((k, kIdx) => (
                        <kbd 
                          key={kIdx}
                          className="px-2 py-1 text-[10px] font-bold font-mono text-theme-primary bg-theme-card border border-theme-border/80 rounded-lg shadow-sm capitalize"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-theme-border text-center bg-theme-secondary/5">
          <p className="text-[10px] font-mono text-theme-muted flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <HelpCircle className="h-3.5 w-3.5 text-theme-primary" />
            <span>Press <kbd className="px-1.5 py-0.5 border border-theme-border rounded bg-theme-card font-bold">?</kbd> at any time to summon this dashboard</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
