/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Chrome, Github, Loader2, KeyRound } from 'lucide-react';
import InputField from './InputField.tsx';
import Logo from './Logo.tsx';

interface LoginFormProps {
  onSuccess: (token: string, user: { id: string; email: string; username: string; name: string }) => void;
  onNavigateToRegister: () => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  key?: string;
}

export default function LoginForm({ onSuccess, onNavigateToRegister, addToast }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);

  // Error States
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      // Success
      addToast('success', `Welcome back, ${data.user.name}!`);
      
      // Store remember me token locally
      if (rememberMe) {
        localStorage.setItem('lantern_remember', 'true');
      }

      onSuccess(data.token, data.user);
    } catch (err: any) {
      addToast('error', err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (platform: 'google' | 'github') => {
    setSocialLoading(platform);
    // Simulate high-fidelity social login redirect
    setTimeout(() => {
      addToast('success', `Logged in via ${platform === 'google' ? 'Google' : 'GitHub'} (Interactive Sandbox Mode)`);
      // Simulating Sophia's account as default profile representation for high fidelity
      onSuccess('u_sophia', {
        id: 'u_sophia',
        email: 'sophia@example.com',
        username: 'sophia.sterling',
        name: 'Sophia Sterling'
      });
      setSocialLoading(null);
    }, 1500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
      id="login-form-container"
    >
      <div className="flex flex-col items-center mb-8 text-center" id="login-header-group">
        <Logo size="lg" iconOnly className="mb-4" />
        <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Welcome back to Lantern
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Stay connected. Share moments. Discover design.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="login-form-element">
        {/* Email Address */}
        <InputField
          id="login-email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          error={errors.email}
          disabled={isLoading}
          autoComplete="email"
          required
        />

        {/* Password */}
        <InputField
          id="login-password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={isLoading}
          autoComplete="current-password"
          required
        />

        {/* Controls: Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-sm select-none px-1" id="login-controls">
          <label className="flex items-center gap-2 cursor-pointer text-neutral-600 dark:text-neutral-400 group">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-neutral-300 dark:border-neutral-700 text-amber-500 focus:ring-amber-500/20 focus:ring-offset-0 transition-all accent-amber-500 cursor-pointer"
              id="login-remember-checkbox"
            />
            <span className="group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
              Remember me
            </span>
          </label>

          <button
            type="button"
            onClick={() => addToast('info', 'Password reset instructions have been dispatched to your email.')}
            className="text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer"
            id="login-forgot-password"
          >
            Forgot password?
          </button>
        </div>

        {/* Submit Sign In Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="relative w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 outline-none cursor-pointer focus:ring-4 focus:ring-amber-500/20"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          id="login-submit-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Verifying account details...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Decorative Divider */}
      <div className="relative flex py-5 items-center" id="login-divider">
        <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
        <span className="flex-shrink mx-4 text-xs font-semibold tracking-wider text-neutral-400 uppercase select-none">
          or
        </span>
        <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800" />
      </div>

      {/* Social Providers */}
      <div className="grid grid-cols-2 gap-3" id="social-provider-group">
        <motion.button
          onClick={() => handleSocialLogin('google')}
          disabled={socialLoading !== null || isLoading}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-900/60 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-slate-900 transition-colors text-sm font-semibold cursor-pointer outline-none focus:ring-4 focus:ring-neutral-200 dark:focus:ring-slate-800"
          whileTap={{ scale: 0.97 }}
          id="social-login-google"
        >
          {socialLoading === 'google' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Chrome className="h-4 w-4 text-rose-500" />
          )}
          <span>Google</span>
        </motion.button>

        <motion.button
          onClick={() => handleSocialLogin('github')}
          disabled={socialLoading !== null || isLoading}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white dark:bg-slate-900/60 text-neutral-700 dark:text-neutral-300 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-slate-900 transition-colors text-sm font-semibold cursor-pointer outline-none focus:ring-4 focus:ring-neutral-200 dark:focus:ring-slate-800"
          whileTap={{ scale: 0.97 }}
          id="social-login-github"
        >
          {socialLoading === 'github' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Github className="h-4 w-4 text-neutral-900 dark:text-white" />
          )}
          <span>GitHub</span>
        </motion.button>
      </div>

      {/* Switch Form Trigger */}
      <div className="text-center mt-8 text-sm text-neutral-500 dark:text-neutral-400" id="login-footer">
        Don&apos;t have an account?{' '}
        <button
          onClick={onNavigateToRegister}
          className="font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors underline decoration-2 decoration-amber-500/30 hover:decoration-amber-500 cursor-pointer"
          id="login-navigate-register"
        >
          Sign up for Lantern
        </button>
      </div>
    </motion.div>
  );
}
