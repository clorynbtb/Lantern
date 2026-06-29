/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className = '', iconOnly = false, size = 'md' }: LogoProps) {
  const iconSizes = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
    xl: 'h-24 w-24',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`} id="lantern-logo-wrapper">
      {/* Glow Effect Background */}
      <div className="relative" id="lantern-logo-icon-container">
        <motion.div
          className="absolute -inset-2 rounded-full bg-amber-500/30 blur-lg"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Main Icon Frame */}
        <motion.div
          className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-0.5 shadow-md shadow-amber-500/20 ${iconSizes[size]}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-neutral-900/10">
            {/* SVG Lantern Graphic */}
            <svg
              className="h-[60%] w-[60%] text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Lantern cap */}
              <path d="M12 2v2" />
              <path d="M5 7h14c0-2-3-3-7-3s-7 1-7 3z" />
              {/* Glass body */}
              <path d="M6 7l2 11h8l2-11" />
              {/* Protective metal cage bars */}
              <path d="M10 7v11" />
              <path d="M14 7v11" />
              {/* Flame (glowing center) */}
              <path
                d="M12 11c0 0-1.5 1.5-1.5 2.5s1.5 2.5 1.5 2.5 1.5-1.5 1.5-2.5-1.5-2.5-1.5-2.5z"
                fill="currentColor"
                className="animate-pulse"
              />
              {/* Base */}
              <path d="M8 18h8v2H8z" />
            </svg>
          </div>
        </motion.div>
      </div>

      {!iconOnly && (
        <span
          className={`font-display font-bold tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent ${textSizes[size]}`}
          id="lantern-logo-text"
        >
          Lantern
        </span>
      )}
    </div>
  );
}
