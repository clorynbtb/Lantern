/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Grid, Bookmark, Settings, Edit, Shield, Save, Key, CheckCircle, Moon, Sun, Monitor, Lock, Palette } from 'lucide-react';
import { PostWithAuthor, Profile } from '../types.ts';
import { THEMES } from '../lib/themes.ts';
import SettingsSection from './SettingsSection.tsx';

interface ProfileSectionProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string };
  viewedUsername: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onSetTheme: (theme: string) => void;
  currentTheme: string;
}

export default function ProfileSection({ token, currentUser, viewedUsername, addToast, onSetTheme, currentTheme }: ProfileSectionProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [savedPosts, setSavedPosts] = useState<PostWithAuthor[]>([]);
  const [activeTab, setActiveTab] = useState<'posts' | 'saved' | 'settings'>('posts');
  
  // Edit Profile Fields
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // Password / Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
    fetchSavedPosts();
  }, [viewedUsername]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${viewedUsername}/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setProfile(data.profile);
        setBio(data.profile.bio || '');
        setLocation(data.profile.location || '');
        setWebsite(data.profile.website || '');
        setAvatarUrl(data.profile.avatarUrl || '');
        setCoverUrl(data.profile.coverUrl || '');
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await fetch(`/api/posts?username=${viewedUsername}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch user posts', err);
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch('/api/posts/saved', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSavedPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch saved posts', err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bio, location, website, avatarUrl, coverUrl }),
      });
      const data = await response.json();
      if (response.ok) {
        setProfile({
          ...profile!,
          bio,
          location,
          website,
          avatarUrl: avatarUrl || profile!.avatarUrl,
          coverUrl: coverUrl || profile!.coverUrl,
        });
        setIsEditing(false);
        addToast('success', 'Your profile details have been secured!');
      } else {
        addToast('error', data.error || 'Failed to update profile');
      }
    } catch (err) {
      addToast('error', 'Network failure during profile save.');
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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        addToast('success', 'Security updated: password changed successfully.');
      } else {
        addToast('error', data.error || 'Password update failed.');
      }
    } catch (err) {
      addToast('error', 'Failed to update password');
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-20" id="profile-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-lantern" />
      </div>
    );
  }

  const isMe = currentUser.username === viewedUsername;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8" id="profile-section-root">
      {/* Profile Header (Cover & Stats Card) */}
      <div className="rounded-3xl bg-theme-card border border-theme-border shadow-sm overflow-hidden" id="profile-header-card">
        {/* Cover Photo */}
        <div className="h-44 md:h-56 bg-gradient-to-r from-theme-primary/20 via-orange-500/20 to-yellow-500/10 relative" id="profile-cover">
          <img
            src={coverUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&fit=crop'}
            alt="Profile Cover Background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info & Core Controls */}
        <div className="p-6 md:p-8 relative pt-1" id="profile-info-block">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end -mt-16 md:-mt-20 gap-4 mb-6">
            <div className="relative">
              <img
                src={avatarUrl || profile.avatarUrl}
                alt={profile.name}
                className="h-24 w-24 md:h-32 md:w-32 rounded-3xl object-cover border-4 border-theme-card shadow-md bg-theme-card"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex gap-2">
              {isMe && (
                <>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="py-2 px-4 rounded-xl border border-theme-border text-xs font-semibold hover:bg-theme-secondary/40 transition-all flex items-center gap-1.5 cursor-pointer text-theme-text"
                  >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="p-2 rounded-xl border border-theme-border hover:bg-theme-secondary/40 transition-all cursor-pointer"
                    title="Account Settings"
                  >
                    <Settings className="h-4.5 w-4.5 text-theme-muted" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6" id="profile-detail-grid">
            {/* Identity Text */}
            <div className="md:col-span-8 space-y-2 text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-display text-2xl font-bold text-theme-text">{profile.name}</h2>
                {isMe && (
                  <span className="py-0.5 px-2 bg-theme-primary/10 text-theme-primary text-[10px] font-bold rounded-full">
                    Creator Account
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-theme-muted">@{profile.username}</span>

              {profile.bio && (
                <p className="font-serif text-[15px] sm:text-base text-theme-text/95 mt-2 font-normal max-w-lg leading-relaxed">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-theme-muted font-medium pt-2">
                {profile.location && <span>📍 {profile.location}</span>}
                {profile.website && (
                  <a href={profile.website} target="_blank" rel="noreferrer" className="text-theme-primary hover:underline">
                    🔗 {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>

            {/* Live Stats */}
            <div className="md:col-span-4 flex justify-around md:justify-end gap-6 md:gap-8 border-t md:border-t-0 border-theme-border pt-4 md:pt-0" id="profile-stats">
              <div className="text-center md:text-right">
                <span className="block text-xl font-bold text-theme-text">{posts.length}</span>
                <span className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Posts</span>
              </div>
              <div className="text-center md:text-right">
                <span className="block text-xl font-bold text-theme-text">1,482</span>
                <span className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Followers</span>
              </div>
              <div className="text-center md:text-right">
                <span className="block text-xl font-bold text-theme-text">329</span>
                <span className="text-xs text-theme-muted font-semibold uppercase tracking-wider">Following</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Edit Dialog Overlay */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.form
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onSubmit={handleUpdateProfile}
              className="w-full max-w-lg bg-theme-card border border-theme-border p-6 rounded-2xl shadow-xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-theme-border pb-3">
                <h3 className="font-display font-bold text-lg text-theme-text">Edit Profile Customization</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-theme-muted hover:text-theme-text font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-left">
                <div>
                  <label className="text-xs font-bold text-theme-muted uppercase">Bio / Catchphrase</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full text-sm mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                    placeholder="Describe yourself to Lantern..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-theme-muted uppercase">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-sm mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-theme-muted uppercase">Website</label>
                    <input
                      type="text"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full text-sm mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                      placeholder="e.g. https://portfolio.co"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted uppercase">Avatar Image URL</label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full text-sm mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                    placeholder="Enter image URL"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-theme-muted uppercase">Cover Image URL</label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="w-full text-sm mt-1 px-3 py-2.5 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
                    placeholder="Enter background image URL"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-theme-border">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-theme-muted hover:bg-theme-secondary/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs Layout (Grid View, Bookmarks, and Settings) */}
      <div className="space-y-4" id="profile-tabs-container">
        <div className="flex border-b border-neutral-100 dark:border-slate-900/50 justify-center gap-8 md:gap-12 text-sm select-none" id="profile-tabs-header">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 flex items-center gap-2 font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === 'posts'
                ? 'border-lantern text-lantern'
                : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span>My Posts</span>
          </button>

          {isMe && (
            <>
              <button
                onClick={() => {
                  setActiveTab('saved');
                  fetchSavedPosts();
                }}
                className={`py-3 flex items-center gap-2 font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'border-lantern text-lantern'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                <Bookmark className="h-4 w-4" />
                <span>Saved Bookmarks</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 flex items-center gap-2 font-semibold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-lantern text-lantern'
                    : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                <Settings className="h-4 w-4" />
                <span>Preferences & Privacy</span>
              </button>
            </>
          )}
        </div>

        {/* Tab contents */}
        <div className="min-h-[250px]" id="profile-tab-content-panel">
          {activeTab === 'posts' && (
            posts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="profile-posts-grid">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative aspect-square rounded-2xl bg-neutral-100 dark:bg-slate-900 border border-neutral-100 dark:border-slate-900/60 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer"
                  >
                    {post.media && post.media.length > 0 ? (
                      <img
                        src={post.media[0].url}
                        alt="Post media thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        {post.content.length > 80 ? `${post.content.substring(0, 80)}...` : post.content}
                      </div>
                    )}
                    
                    {/* Hover detail masking layer */}
                    <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-400" id="profile-no-posts">
                No articles or stories posted yet. Make your first publish from the feed dashboard!
              </div>
            )
          )}

          {activeTab === 'saved' && (
            savedPosts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="profile-saved-grid">
                {savedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative aspect-square rounded-2xl bg-neutral-100 dark:bg-slate-900 border border-neutral-100 dark:border-slate-900/60 overflow-hidden shadow-sm flex items-center justify-center cursor-pointer"
                  >
                    {post.media && post.media.length > 0 ? (
                      <img
                        src={post.media[0].url}
                        alt="Post media thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="p-4 text-center text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-medium">
                        {post.content.length > 80 ? `${post.content.substring(0, 80)}...` : post.content}
                      </div>
                    )}
                    
                    <div className="absolute inset-0 bg-neutral-950/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6 text-white font-bold text-sm">
                      <span>❤️ {post.likesCount}</span>
                      <span>💬 {post.commentsCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-neutral-400" id="profile-no-saved">
                No posts saved. Keep bookmarks of beautiful layouts you discover in the main network!
              </div>
            )
          )}

          {activeTab === 'settings' && (
            <SettingsSection
              token={token}
              currentUser={currentUser}
              profile={profile}
              onUpdateProfile={async (updates) => {
                setProfile(prev => prev ? { ...prev, ...updates } : null);
                return true;
              }}
              onSetTheme={onSetTheme}
              currentTheme={currentTheme}
              addToast={addToast}
            />
          )}
        </div>
      </div>
    </div>
  );
}
