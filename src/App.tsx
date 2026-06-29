/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  MessageSquare,
  Compass,
  Shield,
  User as UserIcon,
  LogOut,
  Sun,
  Moon,
  Compass as ExploreIcon,
  Search,
  X,
  Palette,
  Keyboard
} from 'lucide-react';

// Theme helper engine
import { applyThemeVariables, THEMES } from './lib/themes.ts';
import { applyAppearanceSettings } from './components/SettingsSection.tsx';

// Subcomponents
import AuthLayout from './components/AuthLayout.tsx';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import Toast, { ToastMessage } from './components/Toast.tsx';
import FeedSection from './components/FeedSection.tsx';
import ChatSection from './components/ChatSection.tsx';
import ProfileSection from './components/ProfileSection.tsx';
import AdminSection from './components/AdminSection.tsx';
import ExploreSection from './components/ExploreSection.tsx';
import DeveloperDiagnostics from './components/DeveloperDiagnostics.tsx';
import ShortcutsModal from './components/ShortcutsModal.tsx';

// Core types
import { User } from './types.ts';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  
  // Navigation layout states
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'profile' | 'admin' | 'explore'>('feed');
  const [viewedProfileUsername, setViewedProfileUsername] = useState<string>('');
  
  // Custom toast list
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Shortcuts Help Guide
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  
  // Dynamic visual layout states
  const [theme, setTheme] = useState<string>('lantern');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: any[]; hashtags: any[] }>({ users: [], hashtags: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search query effect
  useEffect(() => {
    if (!searchQuery.trim() || !token) {
      setSearchResults({ users: [], hashtags: [] });
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSearchResults({ users: data.users || [], hashtags: data.hashtags || [] });
        }
      } catch (err) {
        console.error('Search error', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, token]);

  // Check initial login session & theme on mount
  useEffect(() => {
    // Session restore
    const savedToken = localStorage.getItem('lantern_token');
    const savedUser = localStorage.getItem('lantern_user');
    
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }

    // Theme check
    const savedTheme = localStorage.getItem('lantern_theme') || 'lantern';
    setTheme(savedTheme);
    applyThemeVariables(savedTheme);
    applySavedAppearanceSettings(savedTheme);

    const handleSettingsUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setIsDeveloperMode(!!customEvent.detail.developerMode);
        applyAppearanceSettings({ ...customEvent.detail, currentTheme: savedTheme });
      }
    };
    window.addEventListener('lantern_settings_updated', handleSettingsUpdate);

    return () => {
      window.removeEventListener('lantern_settings_updated', handleSettingsUpdate);
    };
  }, []);

  // Master Keyboard Shortcuts engine
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept shortcuts when typing in input/textarea fields
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.getAttribute('contenteditable') === 'true'
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      // Check shortcuts
      if (key === '1' || key === 'f') {
        e.preventDefault();
        setActiveTab('feed');
        setViewedProfileUsername('');
        addToast('info', 'Switched to Feed via shortcut');
      } else if (key === '2' || key === 'e') {
        e.preventDefault();
        setActiveTab('explore');
        setViewedProfileUsername('');
        addToast('info', 'Switched to Explore via shortcut');
      } else if (key === '3' || key === 'm') {
        e.preventDefault();
        setActiveTab('chat');
        addToast('info', 'Switched to Messages via shortcut');
      } else if (key === '4' || key === 'p') {
        e.preventDefault();
        if (currentUser?.username) {
          handleViewProfile(currentUser.username);
          addToast('info', 'Switched to Profile via shortcut');
        }
      } else if (key === 't') {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isAuthenticated, currentUser, theme]);

  const applySavedAppearanceSettings = (themeName: string) => {
    const local = localStorage.getItem('lantern_custom_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setIsDeveloperMode(!!parsed.developerMode);
        applyAppearanceSettings({ ...parsed, currentTheme: themeName });
      } catch (e) {
        console.error('Failed to restore custom appearance settings:', e);
      }
    }
  };

  const toggleTheme = () => {
    const keys = Object.keys(THEMES);
    const currentIndex = keys.indexOf(theme);
    const nextIndex = (currentIndex + 1) % keys.length;
    const nextTheme = keys[nextIndex];
    
    setTheme(nextTheme);
    applyThemeVariables(nextTheme);
    applySavedAppearanceSettings(nextTheme);
    localStorage.setItem('lantern_theme', nextTheme);
    
    const themeName = THEMES[nextTheme]?.name || nextTheme;
    addToast('success', `Switched to ${themeName} theme`);
  };

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    applyThemeVariables(newTheme);
    applySavedAppearanceSettings(newTheme);
    localStorage.setItem('lantern_theme', newTheme);
    const themeName = THEMES[newTheme]?.name || newTheme;
    addToast('success', `Aesthetic theme set to ${themeName}`);
  };

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const handleCloseToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAuthSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('lantern_token', newToken);
    localStorage.setItem('lantern_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('lantern_token');
    localStorage.removeItem('lantern_user');
    addToast('success', 'You have signed out of Lantern. Protect your flame.');
  };

  const handleViewProfile = (username: string) => {
    setViewedProfileUsername(username);
    setActiveTab('profile');
  };

  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text transition-colors duration-300 font-sans relative" style={{ backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text)' }}>
      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          /* Authentication Screen */
          <AuthLayout key="auth-layout">
            <AnimatePresence mode="wait">
              {authView === 'login' ? (
                <LoginForm
                  key="login-form"
                  onSuccess={handleAuthSuccess}
                  onNavigateToRegister={() => setAuthView('register')}
                  addToast={addToast}
                />
              ) : (
                <RegisterForm
                  key="register-form"
                  onSuccess={handleAuthSuccess}
                  onNavigateToLogin={() => setAuthView('login')}
                  addToast={addToast}
                />
              )}
            </AnimatePresence>
          </AuthLayout>
        ) : (
          /* Main Authenticated Application Canvas */
          <motion.div
            key="app-main-canvas"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col min-h-screen"
            id="app-main-view"
          >
            {/* Header Navigation Bar */}
            <header
              className="sticky top-0 z-40 bg-theme-surface backdrop-blur-md border-b border-theme-border select-none px-4"
              id="app-main-header"
            >
              <div className="max-w-6xl mx-auto h-16 flex items-center justify-between">
                {/* Logo and Brand Title */}
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => {
                    setActiveTab('feed');
                    setViewedProfileUsername('');
                  }}
                  id="header-brand-logo"
                >
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
                    <svg
                      className="h-[60%] w-[60%] text-white"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                    >
                      <path d="M12 2v2M5 7h14c0-2-3-3-7-3s-7 1-7 3zM6 7l2 11h8l2-11M10 7v11M14 7v11M8 18h8v2H8z" />
                    </svg>
                  </div>
                  <span className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 dark:from-white dark:via-neutral-100 dark:to-neutral-300 bg-clip-text text-transparent">
                    Lantern
                  </span>
                </div>

                {/* Search Navigation Bar Area */}
                <div className="relative flex-grow max-w-[180px] sm:max-w-xs mx-2 sm:mx-4" id="header-search-container">
                  <div className="relative flex items-center z-50">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-neutral-400 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      onFocus={() => setShowSearchDropdown(true)}
                      placeholder="Search creators or tags..."
                      className="w-full pl-8.5 pr-8 py-1.5 text-xs bg-neutral-100/70 dark:bg-slate-900/70 hover:bg-neutral-100 dark:hover:bg-slate-900 border-0 rounded-xl outline-none focus:ring-1 focus:ring-lantern focus:bg-white dark:focus:bg-slate-950 transition-all text-neutral-800 dark:text-neutral-100 placeholder-neutral-400"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setSearchResults({ users: [], hashtags: [] });
                        }}
                        className="absolute right-3 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Dropdown Results List */}
                  <AnimatePresence>
                    {showSearchDropdown && (searchQuery.trim() !== '') && (
                      <>
                        <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSearchDropdown(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-950 border border-neutral-150 dark:border-slate-800/80 rounded-2xl shadow-xl overflow-hidden z-50 p-2"
                          id="search-dropdown-results"
                        >
                          {isSearching ? (
                            <div className="flex items-center justify-center py-6 text-neutral-400 text-xs gap-2">
                              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-lantern/30 border-t-lantern" />
                              <span>Searching...</span>
                            </div>
                          ) : searchResults.users.length === 0 && searchResults.hashtags.length === 0 ? (
                            <div className="py-6 text-center text-xs text-neutral-400">
                              No results found for "{searchQuery}"
                            </div>
                          ) : (
                            <div className="max-h-[300px] overflow-y-auto space-y-3 p-1">
                              {/* Creators section */}
                              {searchResults.users.length > 0 && (
                                <div>
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2.5 mb-1.5 text-left">Creators</p>
                                  <div className="space-y-1">
                                    {searchResults.users.map((u) => (
                                      <div
                                        key={u.id}
                                        onClick={() => {
                                          handleViewProfile(u.username);
                                          setSearchQuery('');
                                          setShowSearchDropdown(false);
                                        }}
                                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-900 cursor-pointer transition-colors"
                                      >
                                        <img
                                          src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'}
                                          alt={u.name}
                                          className="h-7 w-7 rounded-full object-cover border border-neutral-100 dark:border-slate-800"
                                        />
                                        <div className="truncate text-left">
                                          <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-100 truncate">{u.name}</p>
                                          <p className="text-[10px] text-neutral-400 truncate">@{u.username}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Hashtags section */}
                              {searchResults.hashtags.length > 0 && (
                                <div className="pt-1.5 border-t border-neutral-50 dark:border-slate-900/60">
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2.5 mb-1.5 text-left">Hashtags</p>
                                  <div className="space-y-0.5">
                                    {searchResults.hashtags.map((h, i) => (
                                      <div
                                        key={i}
                                        onClick={() => {
                                          addToast('info', `Discovered hashtag: #${h.tag}`);
                                          setSearchQuery('');
                                          setShowSearchDropdown(false);
                                        }}
                                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-slate-900 cursor-pointer transition-colors text-neutral-700 dark:text-neutral-300"
                                      >
                                        <div className="h-6 w-6 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-500 flex items-center justify-center flex-shrink-0">
                                          <span className="text-xs font-bold">#</span>
                                        </div>
                                        <div className="truncate text-left">
                                          <p className="text-xs font-semibold">#{h.tag}</p>
                                          <p className="text-[10px] text-neutral-400">{h.count || 1} post(s)</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                {/* Central Tab Switches */}
                <nav className="flex items-center gap-1 md:gap-3" id="header-nav-toolbar">
                  <button
                    onClick={() => {
                      setActiveTab('feed');
                      setViewedProfileUsername('');
                    }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'feed'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
                    title="Home Feed"
                  >
                    <Home className="h-5 w-5" />
                    <span className="hidden md:inline text-xs">Feed</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('explore');
                      setViewedProfileUsername('');
                    }}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'explore'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
                    title="Explore Network"
                  >
                    <Compass className="h-5 w-5" />
                    <span className="hidden md:inline text-xs">Explore</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'chat'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
                    title="Direct Messenger"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span className="hidden md:inline text-xs">Messages</span>
                  </button>

                  <button
                    onClick={() => handleViewProfile(currentUser.username)}
                    className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                      activeTab === 'profile' && viewedProfileUsername === currentUser.username
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                        : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                    }`}
                    title="My Profile"
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="hidden md:inline text-xs">Profile</span>
                  </button>

                  {isAdmin && (
                    <button
                      onClick={() => setActiveTab('admin')}
                      className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                        activeTab === 'admin'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-500 font-bold'
                          : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
                      }`}
                      title="Admin Center"
                    >
                      <Shield className="h-5 w-5" />
                      <span className="hidden md:inline text-xs">Admin</span>
                    </button>
                  )}
                </nav>

                {/* Right utility buttons: theme toggle, logout */}
                <div className="flex items-center gap-2" id="header-utilities">
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl border border-neutral-200/40 dark:border-slate-800/40 hover:bg-neutral-50 dark:hover:bg-slate-900 transition-colors text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                    title="Toggle Theme Mode"
                  >
                    {theme === 'light' ? <Moon className="h-4.5 w-4.5" /> : <Sun className="h-4.5 w-4.5" />}
                  </button>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 rounded-xl border border-rose-200/40 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main view container */}
            <main className="flex-grow py-8 px-4" id="app-main-content-area">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab + viewedProfileUsername}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  {activeTab === 'feed' && (
                    <FeedSection
                      token={token!}
                      currentUser={currentUser}
                      addToast={addToast}
                      onViewProfile={handleViewProfile}
                      isAdmin={isAdmin}
                    />
                  )}

                  {activeTab === 'chat' && (
                    <ChatSection
                      token={token!}
                      currentUser={currentUser}
                      addToast={addToast}
                    />
                  )}

                  {activeTab === 'profile' && (
                    <ProfileSection
                      token={token!}
                      currentUser={currentUser}
                      viewedUsername={viewedProfileUsername || currentUser.username}
                      addToast={addToast}
                      onSetTheme={handleSetTheme}
                      currentTheme={theme}
                    />
                  )}

                  {activeTab === 'admin' && (
                    <AdminSection
                      token={token!}
                      addToast={addToast}
                    />
                  )}

                  {activeTab === 'explore' && (
                    <ExploreSection
                      token={token!}
                      addToast={addToast}
                      onViewProfile={handleViewProfile}
                      currentUser={currentUser}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Developer mode floating HUD controls */}
      {isDeveloperMode && token && (
        <DeveloperDiagnostics 
          token={token} 
          addToast={addToast}
          onRefreshData={() => {
            window.dispatchEvent(new CustomEvent('sandbox_data_refreshed'));
          }}
        />
      )}

      {/* Floating Keyboard Shortcuts Trigger Button */}
      {isAuthenticated && (
        <div className="fixed bottom-6 right-6 z-45" id="floating-shortcuts-trigger-container">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsShortcutsOpen(true)}
            className="p-3.5 bg-theme-card hover:bg-theme-secondary/20 border border-theme-border text-theme-primary rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all group lantern-glow hover:border-theme-primary"
            title="Open Mindful Shortcuts Guide (?)"
          >
            <Keyboard className="h-5 w-5 group-hover:rotate-6 transition-transform" />
          </motion.button>
        </div>
      )}

      {/* Mindful Shortcuts Overlay Drawer */}
      <AnimatePresence>
        {isShortcutsOpen && (
          <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />
        )}
      </AnimatePresence>

      {/* Floating high-fidelity alerts stack */}
      <Toast messages={toasts} onClose={handleCloseToast} />
    </div>
  );
}
