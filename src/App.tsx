/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, MessageSquare, Compass, Shield, User as UserIcon,
  Sun, Moon, Search, X, Keyboard, LogOut, Lock, Users
} from 'lucide-react';

import { applyThemeVariables, THEMES } from './lib/themes.ts';
import { applyAppearanceSettings } from './components/SettingsSection.tsx';

import LandingPage from './components/LandingPage.tsx';
import GuestAuthPrompt from './components/GuestAuthPrompt.tsx';
import AuthLayout from './components/AuthLayout.tsx';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import Toast, { ToastMessage } from './components/Toast.tsx';
import FeedSection from './components/FeedSection.tsx';
import ChatSection from './components/ChatSection.tsx';
import ProfileSection from './components/ProfileSection.tsx';
import AdminSection from './components/AdminSection.tsx';
import ExploreSection from './components/ExploreSection.tsx';
import CommunitiesSection from './components/CommunitiesSection.tsx';
import DeveloperDiagnostics from './components/DeveloperDiagnostics.tsx';
import ShortcutsModal from './components/ShortcutsModal.tsx';

export default function App() {
  type AppState = 'landing' | 'guest' | 'authenticated';
  const [appState, setAppState] = useState<AppState>('landing');
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'chat' | 'profile' | 'admin' | 'explore' | 'communities'>('feed');
  const [viewedProfileUsername, setViewedProfileUsername] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [theme, setTheme] = useState('lantern');
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{ users: any[]; hashtags: any[] }>({ users: [], hashtags: [] });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [guestPrompt, setGuestPrompt] = useState<{ open: boolean; action: string }>({ open: false, action: '' });

  const isGuest = appState === 'guest';
  const isAuthenticated = appState === 'authenticated';
  const isAdmin = currentUser?.role?.toLowerCase() === 'admin';

  useEffect(() => {
    const savedToken = localStorage.getItem('lantern_token');
    const savedUser = localStorage.getItem('lantern_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(JSON.parse(savedUser));
      setAppState('authenticated');
    }
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
    return () => window.removeEventListener('lantern_settings_updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || !token) {
      setSearchResults({ users: [], hashtags: [] });
      return;
    }
    const delayDebounce = setTimeout(async () => {
      setIsSearching(true);
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`, { headers });
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

  useEffect(() => {
    if (!isAuthenticated && !isGuest) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '') ||
        document.activeElement?.getAttribute('contenteditable') === 'true') return;
      const key = e.key.toLowerCase();
      if (key === '1' || key === 'f') {
        e.preventDefault();
        setActiveTab('feed');
        setViewedProfileUsername('');
        addToast('info', 'Switched to Feed');
      } else if (key === '2' || key === 'e') {
        e.preventDefault();
        setActiveTab('explore');
        setViewedProfileUsername('');
        addToast('info', 'Switched to Explore');
      } else if (key === '5' || key === 'c') {
        e.preventDefault();
        setActiveTab('communities');
        setViewedProfileUsername('');
        addToast('info', 'Switched to Communities');
      } else if (key === '3' || key === 'm') {
        if (isGuest) { showGuestPrompt('Messaging'); return; }
        e.preventDefault();
        setActiveTab('chat');
        addToast('info', 'Switched to Messages');
      } else if (key === '4' || key === 'p') {
        if (isGuest) { showGuestPrompt('Viewing your profile'); return; }
        e.preventDefault();
        if (currentUser?.username) {
          handleViewProfile(currentUser.username);
          addToast('info', 'Switched to Profile');
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
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, isGuest, currentUser, theme]);

  const applySavedAppearanceSettings = (themeName: string) => {
    const local = localStorage.getItem('lantern_custom_settings');
    if (local) {
      try {
        const parsed = JSON.parse(local);
        setIsDeveloperMode(!!parsed.developerMode);
        applyAppearanceSettings({ ...parsed, currentTheme: themeName });
      } catch (e) {
        console.error('Failed to restore appearance settings:', e);
      }
    }
  };

  const toggleTheme = () => {
    const keys = Object.keys(THEMES);
    const nextTheme = keys[(keys.indexOf(theme) + 1) % keys.length];
    setTheme(nextTheme);
    applyThemeVariables(nextTheme);
    applySavedAppearanceSettings(nextTheme);
    localStorage.setItem('lantern_theme', nextTheme);
    addToast('success', `Switched to ${THEMES[nextTheme]?.name || nextTheme}`);
  };

  const handleSetTheme = (newTheme: string) => {
    setTheme(newTheme);
    applyThemeVariables(newTheme);
    applySavedAppearanceSettings(newTheme);
    localStorage.setItem('lantern_theme', newTheme);
    addToast('success', `Theme set to ${THEMES[newTheme]?.name || newTheme}`);
  };

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 5);
    setToasts(prev => [...prev, { id, type, text }]);
  };
  const handleCloseToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const handleAuthSuccess = (newToken: string, user: any) => {
    setToken(newToken);
    setCurrentUser(user);
    setAppState('authenticated');
    setShowAuthOverlay(false);
    setActiveTab('feed');
    localStorage.setItem('lantern_token', newToken);
    localStorage.setItem('lantern_user', JSON.stringify(user));
    addToast('success', `Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    setAppState('landing');
    setToken(null);
    setCurrentUser(null);
    setActiveTab('feed');
    setViewedProfileUsername('');
    setShowAuthOverlay(false);
    localStorage.removeItem('lantern_token');
    localStorage.removeItem('lantern_user');
    addToast('success', 'You have signed out.');
  };

  const handleEnterGuest = () => {
    setAppState('guest');
    setActiveTab('feed');
    setShowAuthOverlay(false);
    addToast('info', 'Welcome! You are browsing as a Guest.');
  };

  const showGuestPrompt = (action: string) => {
    setGuestPrompt({ open: true, action });
  };

  const handleViewProfile = (username: string) => {
    setViewedProfileUsername(username);
    setActiveTab('profile');
  };

  const handleNavigateToAuth = (view: 'login' | 'register') => {
    setAuthView(view);
    setShowAuthOverlay(true);
  };

  const handleNavClick = (tab: 'feed' | 'chat' | 'profile' | 'explore' | 'admin' | 'communities') => {
    if (isGuest && (tab === 'chat' || (tab === 'profile' && !currentUser) || tab === 'admin')) {
      showGuestPrompt(tab === 'chat' ? 'Messaging' : tab === 'admin' ? 'Admin Dashboard' : 'Viewing your profile');
      return;
    }
    setActiveTab(tab);
    if (tab !== 'profile') setViewedProfileUsername('');
    if (tab === 'profile' && currentUser && isAuthenticated) {
      handleViewProfile(currentUser.username);
    }
  };

  // Landing page
  if (appState === 'landing') {
    return (
      <>
        <LandingPage
          onNavigateToAuth={handleNavigateToAuth}
          onEnterGuestMode={handleEnterGuest}
          addToast={addToast}
        />
        <AnimatePresence>
          {showAuthOverlay && (
            <motion.div
              key="auth-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60]"
            >
              <AuthLayout>
                <AnimatePresence mode="wait">
                  {authView === 'login' ? (
                    <LoginForm
                      key="login"
                      onSuccess={handleAuthSuccess}
                      onNavigateToRegister={() => setAuthView('register')}
                      addToast={addToast}
                    />
                  ) : (
                    <RegisterForm
                      key="register"
                      onSuccess={handleAuthSuccess}
                      onNavigateToLogin={() => setAuthView('login')}
                      addToast={addToast}
                    />
                  )}
                </AnimatePresence>
              </AuthLayout>
            </motion.div>
          )}
        </AnimatePresence>
        <Toast messages={toasts} onClose={handleCloseToast} />
      </>
    );
  }

  // Main app (guest or authenticated)
  const activeNavClasses = 'text-amber-500 dark:text-amber-400 bg-amber-500/10 dark:bg-amber-500/10';
  const inactiveNavClasses = 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/50 hover:text-neutral-900 dark:hover:text-neutral-200';

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] dark:bg-[#0C0A09] text-neutral-900 dark:text-neutral-100 transition-colors duration-300 font-sans">
      {/* Top Bar */}
      <div className="h-16 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 border-b border-neutral-200 dark:border-slate-800 bg-[#FAF8F5]/90 dark:bg-[#0C0A09]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-md shadow-amber-500/10 cursor-pointer hover:scale-105 transition-transform" onClick={() => handleNavClick('feed')}>
            <svg className="h-[60%] w-[60%] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2v2M5 7h14c0-2-3-3-7-3s-7 1-7 3zM6 7l2 11h8l2-11M10 7v11M14 7v11M8 18h8v2H8z" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg hidden sm:block select-none">Lantern</span>
          {isGuest && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Guest
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2 w-48 sm:w-64">
              <Search className="h-4 w-4 text-neutral-400" />
              <input type="text" placeholder="Search users & hashtags..." className="bg-transparent text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 outline-none flex-1 w-full" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }} onFocus={() => setShowSearchDropdown(true)} />
              {isSearching && <div className="h-3 w-3 rounded-full border-2 border-neutral-300 border-t-amber-500 animate-spin" />}
              {searchQuery && !isSearching && <button className="text-neutral-400 hover:text-neutral-600 cursor-pointer" onClick={() => { setSearchQuery(''); setShowSearchDropdown(false); }}><X className="h-3.5 w-3.5" /></button>}
            </div>
            <AnimatePresence>
              {showSearchDropdown && (searchResults.users.length > 0 || searchResults.hashtags.length > 0) && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-neutral-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50">
                  {searchResults.users.length > 0 && (
                    <div className="p-3">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">Users</div>
                      {searchResults.users.map((u: any) => (
                        <button key={u.id} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer" onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); handleViewProfile(u.username); }}>
                          <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{u.name}</p>
                            <p className="text-xs text-neutral-400">@{u.username}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.hashtags.length > 0 && (
                    <div className="p-3 border-t border-neutral-100 dark:border-slate-800">
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-2 px-2">Hashtags</div>
                      {searchResults.hashtags.map((h: any) => (
                        <button key={h.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer" onClick={() => { setShowSearchDropdown(false); setSearchQuery(''); setActiveTab('explore'); }}>
                          <span className="text-sm font-medium text-amber-500">#{h.tag}</span>
                          <span className="text-xs text-neutral-400">{h.postCount} posts</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Theme Toggle */}
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer hidden sm:block" onClick={toggleTheme} title="Toggle Theme (t)">
            {theme === 'lantern' || theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          {/* Admin Only */}
          {isAdmin && (
            <button className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors ${activeTab === 'admin' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('admin')}>
              <Shield className="h-4 w-4" /> <span className="hidden sm:inline">Admin</span>
            </button>
          )}
          {/* Developer Diagnostics */}
          {isDeveloperMode && <DeveloperDiagnostics token={token || ''} addToast={addToast} />}
          {/* Shortcuts */}
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors hidden sm:block cursor-pointer" onClick={() => setIsShortcutsOpen(true)} title="Shortcuts (?)">
            <Keyboard className="h-4 w-4" />
          </button>
          {/* Logout / Switch */}
          <button className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors cursor-pointer" onClick={handleLogout} title="Exit">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <div className="w-16 sm:w-64 flex-shrink-0 flex flex-col justify-between py-6 border-r border-neutral-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          <div className="flex flex-col gap-1 px-2">
            <button className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${activeTab === 'feed' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('feed')}>
              <Home className="h-5 w-5" /> <span className="hidden sm:inline">Feed</span>
            </button>
            <button className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${activeTab === 'explore' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('explore')}>
              <Compass className="h-5 w-5" /> <span className="hidden sm:inline">Explore</span>
            </button>
            <button className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${activeTab === 'communities' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('communities')}>
              <Users className="h-5 w-5" /> <span className="hidden sm:inline">Communities</span>
            </button>
            <button className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${activeTab === 'chat' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('chat')}>
              <MessageSquare className="h-5 w-5" /> <span className="hidden sm:inline">Messages</span>
              {isGuest && <Lock className="h-3 w-3 text-amber-500 ml-auto sm:hidden" />}
            </button>
            <button className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-sm font-medium cursor-pointer ${activeTab === 'profile' ? activeNavClasses : inactiveNavClasses}`} onClick={() => handleNavClick('profile')}>
              <UserIcon className="h-5 w-5" /> <span className="hidden sm:inline">Profile</span>
              {isGuest && <Lock className="h-3 w-3 text-amber-500 ml-auto sm:hidden" />}
            </button>
          </div>
          <div className="px-4 hidden sm:block">
            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 dark:border-amber-500/10">
              <p className="text-[11px] font-bold text-amber-500 uppercase tracking-wider mb-1">Keyboard</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Press <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px] border border-neutral-200 dark:border-neutral-700">?</kbd> for shortcuts</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative" id="main-content">
          <div className="max-w-3xl mx-auto w-full p-4 sm:p-6 pb-24">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' && (
                <motion.div key="feed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <FeedSection token={token || ''} currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', avatarUrl: '' }} addToast={addToast} onViewProfile={handleViewProfile} isAdmin={isAdmin} isGuest={isGuest} onGuestPrompt={showGuestPrompt} />
                </motion.div>
              )}
              {activeTab === 'explore' && (
                <motion.div key="explore" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <ExploreSection token={token || ''} currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', avatarUrl: '' }} addToast={addToast} onViewProfile={handleViewProfile} isGuest={isGuest} onGuestPrompt={showGuestPrompt} />
                </motion.div>
              )}
              {activeTab === 'communities' && (
                <motion.div key="communities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <CommunitiesSection token={token || ''} currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', avatarUrl: '' }} addToast={addToast} onViewProfile={handleViewProfile} isGuest={isGuest} onGuestPrompt={showGuestPrompt} />
                </motion.div>
              )}
              {activeTab === 'chat' && isAuthenticated && (
                <motion.div key="chat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <ChatSection token={token || ''} currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', avatarUrl: '' }} addToast={addToast} />
                </motion.div>
              )}
              {activeTab === 'profile' && isAuthenticated && (
                <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <ProfileSection token={token || ''} currentUser={currentUser || { id: 'guest', name: 'Guest', username: 'guest', avatarUrl: '' }} viewedUsername={viewedProfileUsername || currentUser?.username} addToast={addToast} onSetTheme={handleSetTheme} currentTheme={theme} />
                </motion.div>
              )}
              {activeTab === 'admin' && isAdmin && (
                <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                  <AdminSection token={token || ''} addToast={addToast} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Shortcuts Modal */}
      {isShortcutsOpen && <ShortcutsModal onClose={() => setIsShortcutsOpen(false)} />}

      {/* Guest Auth Prompt */}
      <GuestAuthPrompt
        isOpen={guestPrompt.open}
        onClose={() => setGuestPrompt({ open: false, action: '' })}
        onNavigateToAuth={handleNavigateToAuth}
        action={guestPrompt.action}
      />

      {/* Toast */}
      <Toast messages={toasts} onClose={handleCloseToast} />
    </div>
  );
}
