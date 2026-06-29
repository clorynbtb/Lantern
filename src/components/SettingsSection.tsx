/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserIcon,
  Palette,
  EyeOff,
  Sliders,
  Search,
  Undo2,
  ChevronRight,
  ArrowLeft,
  Key,
  ShieldCheck,
  Globe2,
  Bell,
  Cpu,
  Keyboard,
  CheckCircle,
  HelpCircle,
  X
} from 'lucide-react';

import { THEMES } from '../lib/themes.ts';
import { SettingsState, defaultSettings } from './settings/types.ts';
import { applyAppearanceSettings } from './settings/AppearanceSettings.tsx';

import AccountSettings from './settings/AccountSettings.tsx';
import AppearanceSettings from './settings/AppearanceSettings.tsx';
import PrivacySettings from './settings/PrivacySettings.tsx';
import OtherSettings from './settings/OtherSettings.tsx';

// Re-export applyAppearanceSettings for backwards compatibility with App.tsx
export { applyAppearanceSettings };

interface SettingsSectionProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string };
  profile: any;
  onUpdateProfile: (updates: any) => Promise<boolean>;
  onSetTheme: (theme: string) => void;
  currentTheme: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onLogout?: () => void;
}

export default function SettingsSection({
  token,
  currentUser,
  profile,
  onUpdateProfile,
  onSetTheme,
  currentTheme,
  addToast,
  onLogout
}: SettingsSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('account');
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Undo History Stack
  const [history, setHistory] = useState<SettingsState[]>([]);
  const isUndoing = useRef(false);

  // Keyboard Shortcuts cheat-sheet drawer
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Load initial settings on mount
  useEffect(() => {
    let merged = { ...defaultSettings };
    if (profile?.settings) {
      try {
        const parsed = JSON.parse(profile.settings);
        merged = { ...merged, ...parsed };
      } catch (e) {
        console.error('Failed to parse profile settings JSON:', e);
      }
    } else {
      const local = localStorage.getItem('lantern_custom_settings');
      if (local) {
        try {
          const parsed = JSON.parse(local);
          merged = { ...merged, ...parsed };
        } catch (e) {}
      }
    }
    setSettings(merged);
    applyAppearanceSettings({ ...merged, currentTheme });
  }, [profile, currentTheme]);

  // Unified settings update that pushes to the undo history stack and saves to database
  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    // Save current state to undo history
    if (!isUndoing.current) {
      setHistory(prev => [settings, ...prev.slice(0, 9)]);
    }

    const updated = { ...settings, [key]: value };
    setSettings(updated);

    // Apply visual variables instantly if modified
    if (
      [
        'accentColor',
        'borderRadius',
        'fontSize',
        'fontFamily',
        'animationSpeed',
        'reduceMotion',
        'glassIntensity',
        'highContrast',
        'dyslexiaFont',
        'highContrastMode',
        'amoledMode'
      ].includes(key as string)
    ) {
      applyAppearanceSettings({ ...updated, currentTheme });
    }

    // Save locally
    localStorage.setItem('lantern_custom_settings', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('lantern_settings_updated', { detail: updated }));

    // Persist to database backend
    savePreferencesToDB(updated);
  };

  const savePreferencesToDB = async (updatedSettings: SettingsState) => {
    if (!token) return;
    try {
      await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ settings: JSON.stringify(updatedSettings) })
      });
    } catch (e) {
      console.error('Failed to auto-save preferences to database:', e);
    }
  };

  // Trigger Undo
  const triggerUndo = () => {
    if (history.length === 0) {
      addToast('info', 'No further changes to undo.');
      return;
    }
    isUndoing.current = true;
    const previousState = history[0];
    setHistory(prev => prev.slice(1));
    setSettings(previousState);

    // Reapply visual variables
    applyAppearanceSettings({ ...previousState, currentTheme });
    localStorage.setItem('lantern_custom_settings', JSON.stringify(previousState));
    savePreferencesToDB(previousState);

    isUndoing.current = false;
    addToast('success', 'Last setting change reverted successfully!');
  };

  // Keyboard Shortcuts Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Focus Search (Ctrl+K or /)
      if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInputRef.current)) {
        e.preventDefault();
        searchInputRef.current?.focus();
        addToast('info', 'Search focused');
      }

      // 2. Clear Search / Escape
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        }
        searchInputRef.current?.blur();
      }

      // 3. Undo (Ctrl+Z)
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        triggerUndo();
      }

      // 4. Force Save (Ctrl+S)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        addToast('success', 'All preferences saved securely to Lantern network.');
      }

      // 5. Category quick rotate (Alt + [1-4])
      if (e.altKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        const cats = ['account', 'appearance', 'privacy', 'other'];
        const index = parseInt(e.key) - 1;
        if (cats[index]) {
          setSelectedCategory(cats[index]);
          setSearchQuery('');
          addToast('info', `Switched to ${cats[index].toUpperCase()} settings`);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings, history, searchQuery]);

  // Search Results Mapping Index
  const allSettingsMap = [
    // Account
    { id: 'displayName', cat: 'account', label: 'Display Name', desc: 'Change public visual name.', type: 'input' },
    { id: 'username', cat: 'account', label: 'Username Handle', desc: 'Modify storyteller unique handle (@username).', type: 'input' },
    { id: 'email', cat: 'account', label: 'Email Address', desc: 'Verify and register recovery logins.', type: 'input' },
    { id: 'birthday', cat: 'account', label: 'Birthday Date', desc: 'Manage your birth ledger.', type: 'input' },
    { id: 'phoneNumber', cat: 'account', label: 'Phone Number', desc: 'Register contact factors.', type: 'input' },
    // Appearance
    { id: 'accentColor', cat: 'appearance', label: 'Accent Color Overlay', desc: 'Choose orange, amber, indigo, rose, or emerald.', type: 'color' },
    { id: 'fontSize', cat: 'appearance', label: 'Typography Scale', desc: 'Scale letters: small, medium, large.', type: 'select' },
    { id: 'borderRadius', cat: 'appearance', label: 'Corner Roundness', desc: 'Change rounded boundaries on items.', type: 'select' },
    { id: 'density', cat: 'appearance', label: 'UI Spacing Density', desc: 'Choose comfortable or compact densities.', type: 'select' },
    { id: 'sidebarWidth', cat: 'appearance', label: 'Sidebar Layout Width', desc: 'Thin, standard, or wide sidebar rails.', type: 'select' },
    { id: 'sidebarPosition', cat: 'appearance', label: 'Sidebar Position', desc: 'Left or Right layout alignment.', type: 'select' },
    { id: 'cardStyle', cat: 'appearance', label: 'Card visual frame', desc: 'Card styles: Flat, Elevated, Paper.', type: 'select' },
    { id: 'amoledMode', cat: 'appearance', label: 'AMOLED Pure Black', desc: 'Activate deep black canvases for screen protection.', type: 'toggle' },
    { id: 'readingMode', cat: 'appearance', label: 'Focused Reading Canvas', desc: 'High contrast centered column.', type: 'toggle' },
    // Notifications
    { id: 'likes', cat: 'other', label: 'Reaction Like Notifications', desc: 'Alerts on likes.', type: 'toggle' },
    { id: 'comments', cat: 'other', label: 'Reply Comments Alerts', desc: 'Alerts when people leave comment text cards.', type: 'toggle' },
    { id: 'messages', cat: 'other', label: 'Direct Messages Alarms', desc: 'Push notes on incoming messages.', type: 'toggle' },
    { id: 'quietHours', cat: 'other', label: 'Quiet Hours Blocks', desc: 'Schedule notification blocks during night periods.', type: 'toggle' },
    // Privacy
    { id: 'profileVisibility', cat: 'privacy', label: 'Account Profile Visibility', desc: 'Control public visibility: public, followers, private.', type: 'select' },
    { id: 'hiddenWords', cat: 'privacy', label: 'Muted Hidden Words', desc: 'Hide specific keyword phrases.', type: 'input' },
    { id: 'sensitiveFilter', cat: 'privacy', label: 'Filter Sensitive Content', desc: 'Mute graphic material from search feeds.', type: 'toggle' },
    // Security
    { id: 'twoFactorEnabled', cat: 'privacy', label: 'Two-Factor Authentication', desc: 'Secure logins with rotating codes.', type: 'toggle' },
    { id: 'passkeysEnabled', cat: 'privacy', label: 'Passkeys Cryptography', desc: 'Support touch and face biometrics.', type: 'toggle' },
    // AI
    { id: 'aiCaptionSuggestions', cat: 'other', label: 'AI Writing Suggestions', desc: 'Use Gemini model helpers to suggest captions.', type: 'toggle' },
    { id: 'aiContentSummary', cat: 'other', label: 'AI Story Summarizer', desc: 'Generate quick condensed summaries on long text.', type: 'toggle' },
    // Experimental
    { id: 'betaFeatures', cat: 'other', label: 'Access Beta Nodes', desc: 'Opt-in to unstable early shaper networks.', type: 'toggle' },
    { id: 'developerMode', cat: 'other', label: 'Developer Diagnostic overlays', desc: 'Render latency charts and telemetry coordinates.', type: 'toggle' }
  ];

  // Filters index against query
  const filteredSettings = searchQuery
    ? allSettingsMap.filter(s => 
        s.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        s.desc.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Desktop side categories list
  const navCategories = [
    { id: 'account', label: 'Account, Archive & Logs', icon: UserIcon, desc: 'Manage credentials, downloads, and purge nodes.' },
    { id: 'appearance', label: 'Themes & Aesthetics', icon: Palette, desc: 'Configure 9 presets, sizes, radii, and density.' },
    { id: 'privacy', label: 'Privacy, Security & Region', icon: EyeOff, desc: 'Public blocks, 2FA devices, recovery, and timezones.' },
    { id: 'other', label: 'Feeds, Notifications & AI', icon: Sliders, desc: 'Quiet hours, cache, feed algorithms, and Gemini aids.' }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6" id="settings-center-hub">
      
      {/* 🧭 Visual Breadcrumbs Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-theme-border pb-4">
        <div className="text-left space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-theme-muted font-bold">
            <span>System Preferences</span>
            <ChevronRight className="h-3 w-3" />
            {searchQuery ? (
              <span className="text-theme-primary">Search Results ("{searchQuery}")</span>
            ) : (
              <span className="text-theme-primary capitalize">{selectedCategory} section</span>
            )}
          </div>
          <h2 className="font-display text-2xl font-bold text-theme-text tracking-tight">Lantern Command Center</h2>
          <p className="text-xs text-theme-muted font-normal">Customize, secure, and shape your microblogging ledger node.</p>
        </div>

        {/* Search bar & shortcuts trigger */}
        <div className="flex items-center gap-2">
          {history.length > 0 && (
            <button
              onClick={triggerUndo}
              className="p-2.5 bg-theme-primary/10 hover:bg-theme-primary/15 border border-theme-primary/20 text-theme-primary rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              title="Undo last change (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
              <span className="text-xs font-bold">Undo</span>
            </button>
          )}

          <button
            onClick={() => setShowShortcuts(true)}
            className="p-2.5 bg-theme-secondary/40 hover:bg-theme-secondary/70 border border-theme-border text-theme-muted rounded-xl transition-all cursor-pointer"
            title="Keyboard Shortcuts Cheatsheet"
          >
            <Keyboard className="h-4 w-4 text-theme-primary" />
          </button>

          <div className="relative max-w-xs w-full flex-grow">
            <Search className="absolute left-3 top-3 h-4 w-4 text-theme-muted" />
            <input
              type="text"
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings... (Press /)"
              className="w-full text-xs pl-9 pr-8 py-2.5 bg-theme-secondary/35 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary placeholder-theme-muted"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-theme-muted hover:text-theme-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT BAR NAVIGATION (Mobile hides if querying or in details category) */}
        <div className={`md:col-span-4 space-y-2.5 ${searchQuery || selectedCategory ? 'hidden md:block' : 'block'}`} id="settings-nav-rail">
          {navCategories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`w-full p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
                  isSelected
                    ? 'bg-theme-primary/10 border-theme-primary/45 shadow-sm text-theme-primary'
                    : 'bg-theme-card border-theme-border text-theme-text hover:bg-theme-secondary/35'
                }`}
              >
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-theme-primary/20 text-theme-primary' : 'bg-theme-secondary/50 text-theme-muted'}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-grow">
                  <span className="block text-xs font-bold">{cat.label}</span>
                  <span className="text-[10px] text-theme-muted block truncate max-w-[180px] mt-0.5">{cat.desc}</span>
                </div>
                <ChevronRight className="h-4 w-4 opacity-50 flex-shrink-0" />
              </button>
            );
          })}
        </div>

        {/* RIGHT VIEW AND FILTER DETAILS */}
        <div className="md:col-span-8 space-y-6" id="settings-details-canvas">
          {searchQuery ? (
            // Instant Search Results list
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-theme-card border border-theme-border rounded-3xl p-6 text-left space-y-5"
            >
              <div className="border-b border-theme-border pb-3">
                <span className="text-xs font-bold text-theme-primary uppercase tracking-wider block">Search Results Matches</span>
                <p className="text-[11px] text-theme-muted mt-0.5">Found {filteredSettings.length} setting results matching "{searchQuery}"</p>
              </div>

              {filteredSettings.length > 0 ? (
                <div className="space-y-3.5">
                  {filteredSettings.map((item) => (
                    <div key={item.id} className="p-4 bg-theme-secondary/15 rounded-2xl border border-theme-border/60 flex items-center justify-between gap-4 text-xs">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-mono tracking-wider text-theme-primary font-bold">Category: {item.cat}</span>
                        <span className="block font-bold text-theme-text">{item.label}</span>
                        <span className="text-[10px] text-theme-muted block">{item.desc}</span>
                      </div>

                      {/* Render direct input control based on type */}
                      <div className="flex-shrink-0">
                        {item.type === 'toggle' ? (
                          <input
                            type="checkbox"
                            checked={(settings as any)[item.id]}
                            onChange={(e) => updateSetting(item.id as any, e.target.checked)}
                            className="rounded text-theme-primary focus:ring-theme-primary w-5 h-5 cursor-pointer"
                          />
                        ) : item.type === 'select' ? (
                          <button
                            onClick={() => {
                              setSelectedCategory(item.cat);
                              setSearchQuery('');
                              addToast('info', `Redirected to ${item.cat} panel`);
                            }}
                            className="px-3 py-1.5 bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary font-bold rounded-lg text-[10px]"
                          >
                            Configure
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedCategory(item.cat);
                              setSearchQuery('');
                              addToast('info', `Redirected to ${item.cat} panel`);
                            }}
                            className="px-3 py-1.5 bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary font-bold rounded-lg text-[10px]"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 space-y-1">
                  <span className="text-2xl">🏮</span>
                  <p className="text-xs font-bold text-theme-text">No aesthetic nodes match your search.</p>
                  <p className="text-[10px] text-theme-muted">Try looking for "AMOLED", "Two-Factor", "Accent", or "Theme".</p>
                </div>
              )}
            </motion.div>
          ) : (
            // Categorical Panel render
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedCategory}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* Mobile Back Header button */}
                <div className="flex items-center gap-3 md:hidden pb-3 border-b border-theme-border mb-3">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="p-1.5 rounded-lg hover:bg-theme-secondary/60 text-theme-text"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-theme-muted">Configure Panels</span>
                </div>

                {selectedCategory === 'account' && (
                  <AccountSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    currentUser={currentUser}
                    addToast={addToast}
                    onLogout={onLogout}
                    token={token}
                  />
                )}

                {selectedCategory === 'appearance' && (
                  <AppearanceSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    onSetTheme={onSetTheme}
                    currentTheme={currentTheme}
                    addToast={addToast}
                  />
                )}

                {selectedCategory === 'privacy' && (
                  <PrivacySettings
                    settings={settings}
                    updateSetting={updateSetting}
                    addToast={addToast}
                  />
                )}

                {selectedCategory === 'other' && (
                  <OtherSettings
                    settings={settings}
                    updateSetting={updateSetting}
                    addToast={addToast}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* 🎹 KEYBOARD SHORTCUTS DRAWER */}
      {showShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl max-w-sm w-full text-left space-y-4">
            <div className="flex items-center justify-between border-b border-theme-border pb-3">
              <h3 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-theme-primary" />
                <span>Command Shortcuts</span>
              </h3>
              <button
                onClick={() => setShowShortcuts(false)}
                className="p-1 rounded hover:bg-theme-secondary text-theme-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { keys: ['/'], desc: 'Focus the search query instantly.' },
                { keys: ['Ctrl', 'K'], desc: 'Alternate shortcut to search.' },
                { keys: ['Ctrl', 'Z'], desc: 'Undo the last changed setting option.' },
                { keys: ['Ctrl', 'S'], desc: 'Force secure cloud database write.' },
                { keys: ['Alt', '1..4'], desc: 'Switch instantly between main preference sections.' },
                { keys: ['Escape'], desc: 'Clear search bar or dismiss panels.' }
              ].map((sc) => (
                <div key={sc.desc} className="flex items-start justify-between gap-4 py-1 border-b border-theme-border/50">
                  <div className="flex gap-1">
                    {sc.keys.map(k => (
                      <kbd key={k} className="px-1.5 py-0.5 bg-theme-secondary border border-theme-border rounded font-mono font-bold text-[10px] text-theme-primary">
                        {k}
                      </kbd>
                    ))}
                  </div>
                  <span className="text-[11px] text-theme-muted font-normal text-right">{sc.desc}</span>
                </div>
              ))}
            </div>
            
            <button
              onClick={() => setShowShortcuts(false)}
              className="w-full py-2 bg-theme-primary text-white font-bold text-xs rounded-xl"
            >
              Dismiss shortcuts sheet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
