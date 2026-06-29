/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Phone, 
  ShieldAlert, 
  Trash2, 
  Download, 
  Activity, 
  History, 
  Check, 
  Save, 
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { SettingsState } from './types.ts';

interface AccountSettingsProps {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  currentUser: { id: string; email: string; username: string; name: string };
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onLogout?: () => void;
  token: string;
}

export default function AccountSettings({
  settings,
  updateSetting,
  currentUser,
  addToast,
  onLogout,
  token
}: AccountSettingsProps) {
  const [displayName, setDisplayName] = useState(settings.displayName || currentUser.name || '');
  const [username, setUsername] = useState(settings.username || currentUser.username || '');
  const [email, setEmail] = useState(settings.email || currentUser.email || '');
  const [birthday, setBirthday] = useState(settings.birthday || '1995-04-12');
  const [phone, setPhone] = useState(settings.phoneNumber || '+1 (555) 349-2041');
  const [verified, setVerified] = useState(settings.emailVerified);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Modals / Confirmations
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState('');

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: displayName,
          username,
        })
      });

      if (response.ok) {
        updateSetting('displayName', displayName);
        updateSetting('username', username);
        updateSetting('email', email);
        updateSetting('birthday', birthday);
        updateSetting('phoneNumber', phone);
        addToast('success', 'Core account credentials updated successfully!');
      } else {
        const err = await response.json();
        addToast('error', err.error || 'Failed to update credentials.');
      }
    } catch (e) {
      addToast('error', 'Network failure updating account details.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    try {
      const response = await fetch('/api/users/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        addToast('success', 'Security password credentials rotated successfully!');
      } else {
        const err = await response.json();
        addToast('error', err.error || 'Password mismatch error.');
      }
    } catch (e) {
      addToast('error', 'Failed to update password.');
    }
  };

  const triggerEmailVerification = () => {
    addToast('info', `Sending secure email validation token to ${email}...`);
    setTimeout(() => {
      setVerified(true);
      updateSetting('emailVerified', true);
      addToast('success', 'Email validated! Verified badge appended to your node.');
    }, 1500);
  };

  const handleDeactivate = () => {
    addToast('info', 'Deactivating account node and hiding timeline records...');
    setTimeout(() => {
      setIsDeactivating(false);
      addToast('success', 'Your storyteller profile is now inactive and hidden.');
      if (onLogout) onLogout();
    }, 1500);
  };

  const handleDeletePermanently = () => {
    if (deleteConfirmUser.toLowerCase() !== username.toLowerCase()) {
      addToast('error', 'Username confirmation mismatch.');
      return;
    }
    addToast('info', 'Purging node from storyteller network...');
    setTimeout(() => {
      setIsDeleting(false);
      addToast('success', 'Account record permanently deleted. Farewell, traveler.');
      if (onLogout) onLogout();
    }, 1500);
  };

  const downloadAllData = (section: string) => {
    addToast('info', `Compiling ${section} archive...`);
    setTimeout(() => {
      const archiveData = {
        exported: section,
        timestamp: new Date().toISOString(),
        user: { displayName, username, email },
        stats: { posts: 24, comments: 48, bookmarks: 12 },
        schema: 'Lantern Ledger JSON v2.5'
      };
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(archiveData, null, 2));
      const anchor = document.createElement('a');
      anchor.setAttribute('href', dataStr);
      anchor.setAttribute('download', `lantern_archive_${section.toLowerCase()}_${username}.json`);
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      addToast('success', `${section} dataset successfully exported!`);
    }, 1000);
  };

  return (
    <div className="space-y-6 text-left" id="settings-account-panel">
      {/* 👤 Base Credentials Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <User className="h-5 w-5 text-theme-primary" />
          <span>General Credentials</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed font-normal">
          Manage your login names, public display headers, birthdays, and verified contact numbers.
        </p>

        <form onSubmit={handleUpdateAccount} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs mt-1 px-3.5 py-3 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full text-xs mt-1 px-3.5 py-3 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Email Address</label>
              <div className="flex gap-2 items-center mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow text-xs px-3.5 py-3 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                  required
                />
                {verified ? (
                  <span className="px-3 py-1.5 rounded-full text-[10px] bg-theme-success/10 text-theme-success font-bold border border-theme-success/20 flex items-center gap-1">
                    <Check className="h-3 w-3" /> Verified
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={triggerEmailVerification}
                    className="py-1.5 px-3 bg-theme-primary/10 hover:bg-theme-primary/20 text-theme-primary text-[10px] font-bold rounded-xl border border-theme-primary/20 cursor-pointer"
                  >
                    Verify
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs mt-1 px-3.5 py-3 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                placeholder="No phone configured"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-theme-muted uppercase tracking-wider">Birthday Date</label>
              <input
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full text-xs mt-1 px-3.5 py-3 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
              >
                <Save className="h-4 w-4" />
                <span>{isSaving ? 'Securing ledger...' : 'Update Base Profile'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 🔑 Security Password credentials */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-theme-primary" />
          <span>Rotate Security Credentials</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed font-normal">
          Change passwords periodically to protect your social networks, bookmarks, and local data channels.
        </p>

        <form onSubmit={handleUpdatePassword} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end pt-1">
          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold text-theme-muted uppercase">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="sm:col-span-5">
            <label className="text-[10px] font-bold text-theme-muted uppercase">New Security Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
              placeholder="min 6 chars"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={!currentPassword || !newPassword}
              className="w-full py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white text-xs font-bold rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-40"
            >
              Rotate
            </button>
          </div>
        </form>
      </div>

      {/* 📁 Export & Archive Settings */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <FolderOpen className="h-5 w-5 text-theme-primary" />
          <span>Data Storage & Portability</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed font-normal">
          Retrieve an archive bundle of your digital traces in structured JSON schema format, or analyze your node limits.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {[
            { id: 'posts', label: 'Export Posts' },
            { id: 'comments', label: 'Comments Log' },
            { id: 'bookmarks', label: 'Bookmarks' },
            { id: 'messages', label: 'Direct Messages' },
            { id: 'settings', label: 'System Settings' }
          ].map((exp) => (
            <button
              key={exp.id}
              onClick={() => downloadAllData(exp.label)}
              className="p-3 bg-theme-secondary/30 hover:bg-theme-secondary/70 border border-theme-border rounded-2xl flex flex-col items-center justify-center text-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-theme-primary" />
              <span className="text-[10px] font-bold text-theme-text">{exp.label}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs p-3 bg-theme-secondary/15 rounded-xl border border-theme-border/60">
          <div className="space-y-0.5">
            <span className="block font-bold text-theme-text">Interactive Disk Usage Metrics</span>
            <span className="text-[10px] text-theme-muted block font-mono">1.2 GB consumed of 10.0 GB threshold</span>
          </div>
          <span className="px-2.5 py-1 text-[10px] font-mono bg-theme-primary/10 text-theme-primary border border-theme-primary/20 rounded-full font-bold">
            12% Cap
          </span>
        </div>
      </div>

      {/* 📜 Activity History Log */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <History className="h-5 w-5 text-theme-primary" />
          <span>Personal Activity & Ledger Logs</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed font-normal">
          Track and clear records of historical search queries, recently viewed channels, comment timelines, and login lists.
        </p>

        <div className="space-y-2 pt-1">
          {[
            { label: 'Login Chronology', desc: 'Secure history logs of IP locations and timestamps.' },
            { label: 'Device Registry History', desc: 'List of desktop and smartphone user-agents recorded.' },
            { label: 'Like Reactions Log', desc: 'Timeline archive of microblog items you have liked.' },
            { label: 'Search Queries Cache', desc: 'Keywords and names cached inside local browser frames.' }
          ].map((log) => (
            <div key={log.label} className="flex items-center justify-between p-3 rounded-xl bg-theme-secondary/20 border border-theme-border/40 text-xs">
              <div>
                <span className="font-bold text-theme-text block">{log.label}</span>
                <span className="text-[10px] text-theme-muted font-normal mt-0.5 block">{log.desc}</span>
              </div>
              <button
                onClick={() => addToast('success', `Cleared local ${log.label} database logs`)}
                className="px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/20 text-[10px] font-bold rounded-lg cursor-pointer"
              >
                Flush Logs
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ⚠️ Deactivation & Deletion Block */}
      <div className="p-6 rounded-3xl bg-theme-card border border-rose-500/10 border-dashed text-left space-y-4">
        <h4 className="font-display font-bold text-base text-rose-500 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          <span>Erase or Pause Node</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Need to step away? Deactivate temporarily to hide your profile card from search and recommendations, or permanently delete your account ledger.
        </p>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={() => setIsDeactivating(true)}
            className="py-2.5 px-4 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600 border border-yellow-500/20 text-xs font-bold rounded-xl cursor-pointer"
          >
            Pause Storyteller Node
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Permanently Purge Ledger
          </button>
        </div>
      </div>

      {/* MODALS */}
      {isDeactivating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
            <h3 className="font-display font-bold text-lg text-yellow-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Pause Storyteller Account
            </h3>
            <p className="text-xs text-theme-text/85 leading-relaxed">
              This will safely hide your storyteller timeline, likes, and followers from other nodes. Simply log back in anytime to restore full privileges.
            </p>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setIsDeactivating(false)}
                className="py-1.5 px-3 rounded-lg text-xs font-bold text-theme-muted hover:bg-theme-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                className="py-2 px-4 bg-yellow-500 text-white font-bold text-xs rounded-xl"
              >
                Deactivate Node
              </button>
            </div>
          </div>
        </div>
      )}

      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/40 backdrop-blur-sm">
          <div className="bg-theme-card border border-theme-border p-6 rounded-3xl shadow-xl max-w-sm w-full space-y-4">
            <h3 className="font-display font-bold text-lg text-rose-500 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Permanent Account Purge
            </h3>
            <p className="text-xs text-theme-text/85 leading-relaxed">
              Are you sure? This action is absolutely irreversible. All posts, stories, followers, likes, and direct messages will be immediately wiped.
            </p>
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-theme-muted">
                Type your username <strong className="font-mono text-rose-500">{username}</strong> to confirm:
              </label>
              <input
                type="text"
                value={deleteConfirmUser}
                onChange={(e) => setDeleteConfirmUser(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-theme-secondary/50 rounded-lg border border-theme-border text-theme-text"
                placeholder="Type username"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => {
                  setIsDeleting(false);
                  setDeleteConfirmUser('');
                }}
                className="py-1.5 px-3 rounded-lg text-xs font-bold text-theme-muted hover:bg-theme-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePermanently}
                disabled={deleteConfirmUser.toLowerCase() !== username.toLowerCase()}
                className="py-2 px-4 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl"
              >
                Purge Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
