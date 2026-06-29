/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Loader2, UserPlus } from 'lucide-react';
import InputField from './InputField.tsx';
import Logo from './Logo.tsx';

interface RegisterFormProps {
  onSuccess: (token: string, user: { id: string; email: string; username: string; name: string }) => void;
  onNavigateToLogin: () => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  key?: string;
}

export default function RegisterForm({ onSuccess, onNavigateToLogin, addToast }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Validation Error States
  const [errors, setErrors] = useState<{
    name?: string;
    username?: string;
    email?: string;
    password?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Full name is required.';
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    } else if (username.includes(' ')) {
      newErrors.username = 'Username cannot contain spaces.';
    } else if (!/^[a-zA-Z0-9._]+$/.test(username)) {
      newErrors.username = 'Username can only contain letters, numbers, periods, and underscores.';
    }

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username: username.toLowerCase().trim(),
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Try again.');
      }

      addToast('success', `Welcome to Lantern, ${data.user.name}! Your account has been registered.`);
      onSuccess(data.token, data.user);
    } catch (err: any) {
      addToast('error', err.message || 'An unexpected error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full"
      id="register-form-container"
    >
      <div className="flex flex-col items-center mb-6 text-center" id="register-header-group">
        <Logo size="lg" iconOnly className="mb-4" />
        <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
          Create a Lantern Account
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Join a premium space for designers, creators, and professionals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4" id="register-form-element">
        {/* Full Name */}
        <InputField
          id="reg-name"
          label="Full Name"
          type="text"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={errors.name}
          disabled={isLoading}
          autoComplete="name"
          required
        />

        {/* Username */}
        <InputField
          id="reg-username"
          label="Username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (errors.username) setErrors((prev) => ({ ...prev, username: undefined }));
          }}
          error={errors.username}
          disabled={isLoading}
          autoComplete="username"
          required
        />

        {/* Email Address */}
        <InputField
          id="reg-email"
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
          id="reg-password"
          label="Password (min. 6 characters)"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          error={errors.password}
          disabled={isLoading}
          autoComplete="new-password"
          required
        />

        {/* Terms and Conditions Notice */}
        <div className="text-xs text-neutral-400 dark:text-neutral-500 text-center px-2 py-1 leading-relaxed" id="register-terms-notice">
          By signing up, you agree to Lantern&apos;s{' '}
          <span className="font-semibold text-neutral-600 dark:text-neutral-300 hover:underline cursor-pointer">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="font-semibold text-neutral-600 dark:text-neutral-300 hover:underline cursor-pointer">
            Privacy Policy
          </span>.
        </div>

        {/* Submit Sign Up Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          className="relative w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-medium rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2 outline-none cursor-pointer focus:ring-4 focus:ring-amber-500/20"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          id="register-submit-button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Provisioning your profile...</span>
            </>
          ) : (
            <>
              <span>Sign Up</span>
              <UserPlus className="h-4 w-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Switch Form Trigger */}
      <div className="text-center mt-8 text-sm text-neutral-500 dark:text-neutral-400" id="register-footer">
        Already have a Lantern account?{' '}
        <button
          onClick={onNavigateToLogin}
          className="font-bold text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors underline decoration-2 decoration-amber-500/30 hover:decoration-amber-500 cursor-pointer"
          id="register-navigate-login"
        >
          Sign in here
        </button>
      </div>
    </motion.div>
  );
}
