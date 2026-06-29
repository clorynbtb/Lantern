/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Lock, 
  EyeOff, 
  ShieldCheck, 
  Globe, 
  X, 
  Plus, 
  RefreshCw, 
  Smartphone, 
  Shield, 
  Key,
  Globe2,
  Undo2
} from 'lucide-react';
import { SettingsState } from './types.ts';

interface PrivacySettingsProps {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function PrivacySettings({
  settings,
  updateSetting,
  addToast
}: PrivacySettingsProps) {

  const [newBlocked, setNewBlocked] = useState('');
  const [newMuted, setNewMuted] = useState('');
  const [newRestricted, setNewRestricted] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>(settings.backupCodes);
  const [sessions, setSessions] = useState<string[]>(settings.connectedDevices);
  const [recoveryEmail, setRecoveryEmail] = useState(settings.recoveryEmail);

  // Blocked / Muted list management
  const handleAddBlocked = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlocked.trim()) return;
    const name = newBlocked.trim().toLowerCase();
    if (settings.blockedUsers.includes(name)) return;
    const updated = [...settings.blockedUsers, name];
    updateSetting('blockedUsers', updated);
    setNewBlocked('');
    addToast('success', `Added @${name} to blocked ledger.`);
  };

  const handleRemoveBlocked = (name: string) => {
    const updated = settings.blockedUsers.filter(u => u !== name);
    updateSetting('blockedUsers', updated);
    addToast('info', `Removed @${name} from blocked list.`);
  };

  const handleAddMuted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMuted.trim()) return;
    const name = newMuted.trim().toLowerCase();
    if (settings.mutedUsers.includes(name)) return;
    const updated = [...settings.mutedUsers, name];
    updateSetting('mutedUsers', updated);
    setNewMuted('');
    addToast('success', `Muted notifications from @${name}.`);
  };

  const handleRemoveMuted = (name: string) => {
    const updated = settings.mutedUsers.filter(u => u !== name);
    updateSetting('mutedUsers', updated);
    addToast('info', `Unmuted @${name}.`);
  };

  const handleAddRestricted = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestricted.trim()) return;
    const name = newRestricted.trim().toLowerCase();
    if (settings.restrictedUsers.includes(name)) return;
    const updated = [...settings.restrictedUsers, name];
    updateSetting('restrictedUsers', updated);
    setNewRestricted('');
    addToast('success', `Restricted @${name}. Comments are now hidden.`);
  };

  const handleRemoveRestricted = (name: string) => {
    const updated = settings.restrictedUsers.filter(u => u !== name);
    updateSetting('restrictedUsers', updated);
    addToast('info', `Lifted restrictions for @${name}.`);
  };

  // Security Session Revocations
  const revokeSession = (sessionName: string) => {
    const updated = sessions.filter(s => s !== sessionName);
    setSessions(updated);
    addToast('success', `Safely disconnected device session: ${sessionName}`);
  };

  const regenerateBackupCodes = () => {
    const fresh = Array.from({ length: 4 }, () => 
      Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase() + '-' + 
      Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase()
    );
    setBackupCodes(fresh);
    updateSetting('backupCodes', fresh);
    addToast('success', 'Fresh backup emergency recovery keys generated!');
  };

  return (
    <div className="space-y-6 text-left" id="settings-privacy-panel">
      {/* 🔒 Profile Visibility & Content Rights Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <EyeOff className="h-5 w-5 text-theme-primary" />
          <span>Profile Visibility & Story Scopes</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Manage who can see your timeline nodes, comment on your posted cards, tag/mention your handle, or direct message your node.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Account Public Visibility</label>
            <select
              value={settings.profileVisibility}
              onChange={(e) => updateSetting('profileVisibility', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
            >
              <option value="public">🌐 Public (Search indexes visible to anyone)</option>
              <option value="followers">👥 Followers Only (Only approved nodes view stories)</option>
              <option value="private">🔒 Private Account (Requires explicit confirmation)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Direct Message Permissions</label>
            <select
              value={settings.whoCanMessage}
              onChange={(e) => updateSetting('whoCanMessage', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
            >
              <option value="everyone">Everyone (Open messaging gate)</option>
              <option value="followers">Mutual Followers only</option>
              <option value="nobody">Nobody (Lock incoming inbox)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-theme-border pt-4">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Who can Comment</label>
            <select
              value={settings.whoCanComment}
              onChange={(e) => updateSetting('whoCanComment', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Followers</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Who can Mention me</label>
            <select
              value={settings.whoCanMention}
              onChange={(e) => updateSetting('whoCanMention', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Followers</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Who can Share posts</label>
            <select
              value={settings.whoCanShare}
              onChange={(e) => updateSetting('whoCanShare', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="everyone">Everyone</option>
              <option value="followers">Followers</option>
              <option value="nobody">Nobody</option>
            </select>
          </div>
        </div>
      </div>

      {/* 🛡 Content Blur & Sensitivities Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Lock className="h-5 w-5 text-theme-primary" />
          <span>Interactive Content Moderation & Blur Filters</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Define hidden keyword strings, blur graphic media nodes, or mute sensitive hashtag lists.
        </p>

        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Muted Key Phrase List (Comma-separated)</label>
            <input
              type="text"
              value={settings.hiddenWords}
              onChange={(e) => updateSetting('hiddenWords', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
              placeholder="spam, click here, buy crypto"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Muted Hashtag ledger</label>
              <input
                type="text"
                value={settings.hiddenHashtags}
                onChange={(e) => updateSetting('hiddenHashtags', e.target.value)}
                className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
                placeholder="#scam, #crypto"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Muted Mentions ledger</label>
              <input
                type="text"
                value={settings.hiddenMentions}
                onChange={(e) => updateSetting('hiddenMentions', e.target.value)}
                className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
                placeholder="@annoy_bot"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1.5">
            {[
              { id: 'sensitiveFilter', label: 'Filter Sensitive Content' },
              { id: 'nsfwFilter', label: 'Strict NSFW Content Block' },
              { id: 'adultBlur', label: 'Blur Adult Graphic Media' }
            ].map((f) => (
              <label key={f.id} className="flex items-center gap-2 cursor-pointer bg-theme-secondary/15 p-2 rounded-lg border border-theme-border/60">
                <input
                  type="checkbox"
                  checked={(settings as any)[f.id]}
                  onChange={(e) => updateSetting(f.id as any, e.target.checked)}
                  className="rounded text-theme-primary w-4 h-4"
                />
                <span className="text-[10px] text-theme-text font-bold leading-none">{f.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* 👤 Users Ledgers: Blocked, Muted, Restricted */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Globe className="h-5 w-5 text-theme-primary" />
          <span>Blocked, Muted, & Restricted Ledgers</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Govern specific nodes which have been blocked, muted, or restricted from interactively viewing or replying.
        </p>

        {/* Blocks Form */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="space-y-2 border border-theme-border/70 p-3 rounded-2xl bg-theme-secondary/10">
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Blocked Nodes ({settings.blockedUsers.length})</span>
            <form onSubmit={handleAddBlocked} className="flex gap-1">
              <input
                type="text"
                value={newBlocked}
                onChange={(e) => setNewBlocked(e.target.value)}
                placeholder="username"
                className="flex-grow text-[10px] px-2 py-1.5 bg-theme-card rounded-lg border border-theme-border text-theme-text outline-none"
              />
              <button type="submit" className="px-2 bg-theme-primary text-white text-[10px] font-bold rounded-lg">+</button>
            </form>
            <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
              {settings.blockedUsers.map(u => (
                <div key={u} className="flex items-center justify-between text-[10px] bg-theme-card p-1.5 rounded border border-theme-border">
                  <span className="font-semibold">@{u}</span>
                  <button type="button" onClick={() => handleRemoveBlocked(u)} className="text-rose-500 hover:text-rose-700">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Mutes Form */}
          <div className="space-y-2 border border-theme-border/70 p-3 rounded-2xl bg-theme-secondary/10">
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Muted Nodes ({settings.mutedUsers.length})</span>
            <form onSubmit={handleAddMuted} className="flex gap-1">
              <input
                type="text"
                value={newMuted}
                onChange={(e) => setNewMuted(e.target.value)}
                placeholder="username"
                className="flex-grow text-[10px] px-2 py-1.5 bg-theme-card rounded-lg border border-theme-border text-theme-text outline-none"
              />
              <button type="submit" className="px-2 bg-theme-primary text-white text-[10px] font-bold rounded-lg">+</button>
            </form>
            <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
              {settings.mutedUsers.map(u => (
                <div key={u} className="flex items-center justify-between text-[10px] bg-theme-card p-1.5 rounded border border-theme-border">
                  <span className="font-semibold">@{u}</span>
                  <button type="button" onClick={() => handleRemoveMuted(u)} className="text-rose-500 hover:text-rose-700">✕</button>
                </div>
              ))}
            </div>
          </div>

          {/* Restricted Form */}
          <div className="space-y-2 border border-theme-border/70 p-3 rounded-2xl bg-theme-secondary/10">
            <span className="text-[10px] font-bold text-theme-muted uppercase tracking-wider block">Restricted ({settings.restrictedUsers.length})</span>
            <form onSubmit={handleAddRestricted} className="flex gap-1">
              <input
                type="text"
                value={newRestricted}
                onChange={(e) => setNewRestricted(e.target.value)}
                placeholder="username"
                className="flex-grow text-[10px] px-2 py-1.5 bg-theme-card rounded-lg border border-theme-border text-theme-text outline-none"
              />
              <button type="submit" className="px-2 bg-theme-primary text-white text-[10px] font-bold rounded-lg">+</button>
            </form>
            <div className="space-y-1 max-h-24 overflow-y-auto pt-1">
              {settings.restrictedUsers.map(u => (
                <div key={u} className="flex items-center justify-between text-[10px] bg-theme-card p-1.5 rounded border border-theme-border">
                  <span className="font-semibold">@{u}</span>
                  <button type="button" onClick={() => handleRemoveRestricted(u)} className="text-rose-500 hover:text-rose-700">✕</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 🛡 Security credentials & sessions */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-theme-primary" />
          <span>Advanced Device Registry & 2FA</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Setup physical security keys, review device registries, configure recovery email paths, and activate 2FA.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            {/* 2FA Toggle */}
            <label className="flex items-center justify-between p-3.5 bg-theme-secondary/20 rounded-2xl border border-theme-border cursor-pointer">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-xs font-bold text-theme-text block">Two-Factor Authentication (2FA)</span>
                <span className="text-[9px] text-theme-muted block leading-relaxed">Secure credentials using timed tokens.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorEnabled}
                onChange={(e) => {
                  updateSetting('twoFactorEnabled', e.target.checked);
                  addToast('success', e.target.checked ? 'Two-Factor auth triggers activated!' : 'Two-Factor protection removed.');
                }}
                className="rounded text-theme-primary w-4.5 h-4.5"
              />
            </label>

            {/* Passkeys Toggle */}
            <label className="flex items-center justify-between p-3.5 bg-theme-secondary/20 rounded-2xl border border-theme-border cursor-pointer">
              <div className="space-y-0.5 max-w-[80%]">
                <span className="text-xs font-bold text-theme-text block">Passkeys (Biometrics enabled)</span>
                <span className="text-[9px] text-theme-muted block leading-relaxed">Sign in with local device touch ID or face unlocks.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.passkeysEnabled}
                onChange={(e) => {
                  updateSetting('passkeysEnabled', e.target.checked);
                  addToast('success', e.target.checked ? 'Local passkey hooks verified!' : 'Passkey links deactivated.');
                }}
                className="rounded text-theme-primary w-4.5 h-4.5"
              />
            </label>
          </div>

          {/* Backup Codes Card */}
          <div className="p-4 bg-theme-secondary/15 rounded-2xl border border-theme-border space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-text flex items-center gap-1.5">
                <Key className="h-4 w-4 text-theme-primary" /> Emergency Backup Codes
              </span>
              <button
                onClick={regenerateBackupCodes}
                className="text-theme-primary hover:text-theme-primary-hover"
                title="Regenerate codes"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-[9px] text-theme-muted leading-relaxed">
              Store these single-use physical recovery strings in a paper vault to access your node if locked.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code) => (
                <span key={code} className="text-[10px] font-mono font-bold text-theme-text bg-theme-card p-1.5 rounded-lg border border-theme-border/60 text-center">
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Connected Sessions */}
        <div className="space-y-2.5 border-t border-theme-border pt-4">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">Active Device Ledger & Browser Sessions</span>
          <div className="space-y-2">
            {sessions.map((device) => (
              <div key={device} className="flex items-center justify-between p-3 bg-theme-secondary/25 border border-theme-border rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-theme-primary" />
                  <div>
                    <span className="font-bold text-theme-text block">{device}</span>
                    <span className="text-[9px] text-theme-muted block font-mono">Verified Session ID: active_node_2026</span>
                  </div>
                </div>
                <button
                  onClick={() => revokeSession(device)}
                  className="px-2.5 py-1 text-[9px] bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 rounded font-bold cursor-pointer"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Change Recovery Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-theme-border pt-4">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Secondary Recovery Email Address</label>
            <input
              type="email"
              value={recoveryEmail}
              onChange={(e) => setRecoveryEmail(e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
              placeholder="recovery@gmail.com"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                updateSetting('recoveryEmail', recoveryEmail);
                addToast('success', `Recovery address saved: ${recoveryEmail}`);
              }}
              className="w-full py-2 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Update Recovery Address
            </button>
          </div>
        </div>
      </div>

      {/* 🌍 Language & Regional formatting Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Globe2 className="h-5 w-5 text-theme-primary" />
          <span>Language, Timezone & Regional Clocks</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Configure active translation dictionaries, clock systems, calendar triggers, and currency formatting.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Display Language</label>
            <select
              value={settings.language}
              onChange={(e) => updateSetting('language', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="en">English (US Standard)</option>
              <option value="es">Español (Castellano)</option>
              <option value="fr">Français (Parisian)</option>
              <option value="de">Deutsch (Deutschland)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Country Origin</label>
            <select
              value={settings.country}
              onChange={(e) => updateSetting('country', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="DE">Germany</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Active Timezone</label>
            <select
              value={settings.timezone}
              onChange={(e) => updateSetting('timezone', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="America/Los_Angeles">America/Los_Angeles (Pacific)</option>
              <option value="America/New_York">America/New_York (Eastern)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="UTC">Coordinated Universal Time (UTC)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 border-t border-theme-border pt-4">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Date Format</label>
            <select
              value={settings.dateFormat}
              onChange={(e) => updateSetting('dateFormat', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-1.5 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Time Clock</label>
            <select
              value={settings.timeFormat}
              onChange={(e) => updateSetting('timeFormat', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-1.5 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="12h">12-Hour Clock (AM/PM)</option>
              <option value="24h">24-Hour Military Clock</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Decimal Separators</label>
            <select
              value={settings.numberFormat}
              onChange={(e) => updateSetting('numberFormat', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-1.5 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="comma">Comma-separated (1,234.56)</option>
              <option value="dot">Dot-separated (1.234,56)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Week Commences</label>
            <select
              value={settings.weekStartDay}
              onChange={(e) => updateSetting('weekStartDay', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-1.5 bg-theme-secondary/30 rounded-lg border border-theme-border text-theme-text"
            >
              <option value="sunday">Sunday</option>
              <option value="monday">Monday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
