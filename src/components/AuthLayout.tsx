/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import Logo from './Logo.tsx';

interface AuthLayoutProps {
  children: React.ReactNode;
  key?: string;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-[#FAF8F5] dark:bg-[#0C0A09] text-neutral-900 dark:text-neutral-100 transition-colors duration-300 relative overflow-hidden font-sans p-4 sm:p-6 md:p-8"
      id="auth-layout-root"
    >
      {/* Background ambient lighting effects */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0" id="auth-ambient-lighting">
        <motion.div
          className="absolute -top-[20%] -left-[10%] w-[50%] h-[60%] rounded-full bg-amber-500/10 dark:bg-amber-500/5 blur-[120px]"
          animate={{
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[70%] rounded-full bg-orange-600/10 dark:bg-orange-500/5 blur-[150px]"
          animate={{
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Main Container */}
      <div
        className="w-full max-w-6xl h-[90vh] max-h-[840px] grid grid-cols-1 lg:grid-cols-12 rounded-[28px] border border-neutral-200/40 dark:border-slate-800/20 shadow-2xl dark:shadow-amber-500/2 bg-white/75 dark:bg-slate-950/45 backdrop-blur-xl relative z-10 overflow-hidden"
        id="auth-container-grid"
      >
        {/* Left Side: Editorial Presentation (Desktop only) */}
        <div
          className="hidden lg:flex lg:col-span-6 flex-col justify-between p-12 bg-gradient-to-br from-amber-50/50 via-neutral-50/20 to-orange-50/30 dark:from-slate-900/40 dark:via-slate-950/20 dark:to-slate-900/10 border-r border-neutral-100 dark:border-slate-900/40 relative overflow-hidden h-full"
          id="auth-left-branding"
        >
          {/* Decorative fluid visual gradient objects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <motion.div
              className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-gradient-to-tr from-amber-500/10 to-yellow-400/10 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            {/* Elegant grid alignment lines */}
            <svg
              className="absolute inset-0 w-full h-full opacity-[0.03] dark:opacity-[0.06] text-neutral-900 dark:text-white"
              xmlns="http://www.w3.org/2000/svg"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {/* Upper Section: Lantern Brand */}
          <div className="relative z-10" id="auth-left-top">
            <Logo size="lg" />
          </div>

          {/* Middle Section: Slogan & Immersive Graphic */}
          <div className="relative z-10 my-auto" id="auth-left-middle">
            <h1 className="font-display text-4xl xl:text-5xl font-extrabold tracking-tight text-neutral-950 dark:text-white leading-[1.15] mb-6">
              Share moments.
              <br />
              <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                Discover people.
              </span>
              <br />
              Stay connected.
            </h1>
            <p className="text-base text-neutral-500 dark:text-neutral-400 max-w-md leading-relaxed font-normal">
              A crafted architectural canvas for visual social networks. Express your photography, minimal space designs, and authentic stories.
            </p>

            {/* Glowing lantern ring artwork */}
            <div className="mt-12 relative h-48 w-full max-w-sm flex items-center justify-center" id="glowing-lantern-ring">
              <motion.div
                className="absolute w-40 h-40 rounded-full border border-amber-500/20 dark:border-amber-500/10"
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-44 h-44 rounded-full border-2 border-dashed border-amber-500/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="absolute w-28 h-28 rounded-full bg-gradient-to-br from-amber-500/10 to-orange-500/20 blur-xl animate-pulse"
              />
              {/* Floating lights */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-amber-400"
                  initial={{
                    x: Math.sin(i) * 60,
                    y: Math.cos(i) * 60,
                    opacity: 0.3,
                  }}
                  animate={{
                    y: [Math.cos(i) * 60, Math.cos(i) * 60 - 30, Math.cos(i) * 60],
                    opacity: [0.3, 0.9, 0.3],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3 + i,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              ))}
              <div className="absolute font-mono text-[10px] tracking-widest text-amber-500/60 dark:text-amber-500/40 uppercase font-semibold">
                Lantern Engine v1.0
              </div>
            </div>
          </div>

          {/* Lower Section: Tech Footer */}
          <div className="relative z-10 flex items-center justify-between text-xs text-neutral-400 dark:text-slate-500" id="auth-left-bottom">
            <span>&copy; 2026 Lantern Inc. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:text-amber-500 transition-colors cursor-pointer">Security Policy</span>
              <span className="hover:text-amber-500 transition-colors cursor-pointer">API Specs</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form Shell & Display (Center / Full on mobile) */}
        <div
          className="col-span-1 lg:col-span-6 flex flex-col justify-center items-center p-6 sm:p-12 md:p-16 relative overflow-y-auto h-full"
          id="auth-right-panel"
        >
          {/* Subtle mobile-only brand alignment */}
          <div className="lg:hidden absolute top-6 left-6" id="auth-mobile-header">
            <Logo size="sm" />
          </div>

          <div className="w-full max-w-md" id="auth-form-slot">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
