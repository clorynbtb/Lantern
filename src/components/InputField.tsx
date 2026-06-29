/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputFieldProps {
  label: string;
  error?: string;
  id: string;
  type?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoComplete?: string;
  required?: boolean;
}

export default function InputField({ label, error, id, type = 'text', className = '', ...props }: InputFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputProps = props as React.InputHTMLAttributes<HTMLInputElement>;

  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  // Track if input has content to keep the label floating
  const hasValue = !!inputProps.value || !!inputProps.defaultValue;

  return (
    <div className={`relative flex flex-col gap-1 w-full ${className}`} id={`field-container-${id}`}>
      <div className="relative">
        <input
          {...inputProps}
          id={id}
          type={inputType}
          onFocus={(e) => {
            setIsFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            inputProps.onBlur?.(e);
          }}
          className={`peer w-full px-4 pt-5 pb-2 text-sm bg-neutral-50 dark:bg-slate-900/40 text-neutral-900 dark:text-neutral-100 rounded-xl border transition-all duration-200 outline-none ${
            error
              ? 'border-rose-400 focus:border-rose-500 ring-2 ring-rose-400/10'
              : 'border-neutral-200 dark:border-neutral-800 focus:border-amber-500 dark:focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10'
          } ${isPassword ? 'pr-12' : ''}`}
          placeholder=" "
        />
        
        {/* Floating Label */}
        <label
          htmlFor={id}
          className={`absolute left-4 top-1/2 -translate-y-1/2 origin-left text-sm text-neutral-400 dark:text-neutral-500 pointer-events-none transition-all duration-200 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2.5 peer-focus:translate-y-0 peer-focus:scale-75 peer-focus:text-amber-500 dark:peer-focus:text-amber-400 ${
            hasValue ? 'top-2.5 translate-y-0 scale-75 text-neutral-500 dark:text-neutral-400' : ''
          }`}
        >
          {label}
        </label>

        {/* Toggle password visibility */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500/30 rounded-lg p-1"
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            id={`toggle-password-${id}`}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Error message slot with smooth entry */}
      {error && (
        <span
          className="text-xs font-medium text-rose-500 dark:text-rose-400 pl-1 animate-fade-in"
          id={`error-message-${id}`}
        >
          {error}
        </span>
      )}
    </div>
  );
}
