/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Users, Plus, Search, ArrowLeft, Shield, Hash, Calendar,
  Pin, MessageSquare, Check, Globe, Lock, UserPlus, X
} from 'lucide-react';

interface CommunityMember {
  id: string;
  role: 'owner' | 'moderator' | 'member';
  user_id: string;
  joined_at: string;
}

interface CommunityRule {
  id: string;
  title: string;
  description: string;
  order: number;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
}

interface Community {
  id: string;
  name: string;
  description: string;
  avatar_url: string;
  cover_url: string;
  slug: string;
  is_private: boolean;
  member_count: number;
  post_count: number;
  created_at: string;
  created_by: string;
  isMember: boolean;
  memberRole: string | null;
  rules: CommunityRule[];
  events: CommunityEvent[];
  posts: any[];
  members: any[];
}

interface CommunitiesSectionProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string; avatarUrl?: string };
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onViewProfile: (username: string) => void;
  isGuest?: boolean;
  onGuestPrompt?: (action: string) => void;
}

export default function CommunitiesSection({ token, currentUser, addToast, onViewProfile, isGuest, onGuestPrompt }: CommunitiesSectionProps) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', slug: '', isPrivate: false });
  const [isCreating, setIsCreating] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    fetchCommunities();
  }, [token]);

  const fetchCommunities = async () => {
    setIsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch('/api/communities', { headers });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.communities || []);
      }
    } catch (err) {
      console.error('Failed to fetch communities', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommunityDetails = async (slug: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const response = await fetch(`/api/communities/${slug}`, { headers });
      if (response.ok) {
        const data = await response.json();
        setSelectedCommunity(data.community);
      }
    } catch (err) {
      console.error('Failed to fetch community details', err);
    }
  };

  const handleJoin = async (slug: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Joining communities'); return; }
    try {
      const response = await fetch(`/api/communities/${slug}/join`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        addToast('success', 'Joined community successfully');
        fetchCommunities();
        if (selectedCommunity?.slug === slug) fetchCommunityDetails(slug);
      } else {
        const data = await response.json();
        addToast('error', data.error || 'Failed to join');
      }
    } catch (err) {
      addToast('error', 'Failed to join community');
    }
  };

  const handleLeave = async (slug: string) => {
    try {
      const response = await fetch(`/api/communities/${slug}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        addToast('success', 'Left community successfully');
        fetchCommunities();
        if (selectedCommunity?.slug === slug) fetchCommunityDetails(slug);
      } else {
        const data = await response.json();
        addToast('error', data.error || 'Failed to leave');
      }
    } catch (err) {
      addToast('error', 'Failed to leave community');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest && onGuestPrompt) { onGuestPrompt('Creating communities'); return; }
    if (!createForm.name.trim() || !createForm.slug.trim()) return;
    setIsCreating(true);
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(createForm),
      });
      const data = await response.json();
      if (response.ok) {
        addToast('success', 'Community created successfully');
        setShowCreateModal(false);
        setCreateForm({ name: '', description: '', slug: '', isPrivate: false });
        fetchCommunities();
      } else {
        addToast('error', data.error || 'Failed to create community');
      }
    } catch (err) {
      addToast('error', 'Failed to create community');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest && onGuestPrompt) { onGuestPrompt('Posting in communities'); return; }
    if (!selectedCommunity || !postContent.trim()) return;
    setIsPosting(true);
    try {
      const response = await fetch(`/api/communities/${selectedCommunity.slug}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: postContent }),
      });
      if (response.ok) {
        addToast('success', 'Posted to community');
        setPostContent('');
        fetchCommunityDetails(selectedCommunity.slug);
      } else {
        const data = await response.json();
        addToast('error', data.error || 'Failed to post');
      }
    } catch (err) {
      addToast('error', 'Failed to post');
    } finally {
      setIsPosting(false);
    }
  };

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (selectedCommunity) {
    return (
      <div className="space-y-6">
        {/* Community Header */}
        <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
          <div className="h-32 sm:h-40 bg-cover bg-center" style={{ backgroundImage: `url(${selectedCommunity.cover_url})` }}>
            <div className="absolute inset-0 bg-black/30" />
          </div>
          <div className="relative -mt-12 px-6 pb-6">
            <div className="flex items-end gap-4">
              <img src={selectedCommunity.avatar_url} alt={selectedCommunity.name} className="h-20 w-20 rounded-2xl border-4 border-white dark:border-neutral-900 object-cover bg-white" />
              <div className="flex-1 pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">{selectedCommunity.name}</h2>
                  {selectedCommunity.is_private ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center gap-1"><Lock className="h-3 w-3" /> Private</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 flex items-center gap-1"><Globe className="h-3 w-3" /> Public</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {selectedCommunity.member_count} members</span>
                  <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {selectedCommunity.post_count} posts</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedCommunity(null)} className="px-3 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                {selectedCommunity.isMember ? (
                  <button onClick={() => handleLeave(selectedCommunity.slug)} className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-sm font-medium hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors cursor-pointer">
                    Leave
                  </button>
                ) : (
                  <button onClick={() => handleJoin(selectedCommunity.slug)} className="px-4 py-2 rounded-xl bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors cursor-pointer flex items-center gap-1">
                    <UserPlus className="h-4 w-4" /> Join
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Rules */}
        {selectedCommunity.rules.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Shield className="h-4 w-4 text-amber-500" /> Community Rules</h3>
            <div className="space-y-2">
              {selectedCommunity.rules.map((rule, idx) => (
                <div key={rule.id} className="flex gap-3 text-sm">
                  <span className="text-amber-500 font-bold flex-shrink-0">{idx + 1}.</span>
                  <div>
                    <p className="font-semibold">{rule.title}</p>
                    <p className="text-neutral-500 text-xs">{rule.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Events */}
        {selectedCommunity.events.length > 0 && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-5 bg-white dark:bg-neutral-900">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4 text-amber-500" /> Upcoming Events</h3>
            <div className="space-y-3">
              {selectedCommunity.events.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-neutral-500">{event.location} • {new Date(event.event_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Post */}
        {selectedCommunity.isMember && (
          <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
            <form onSubmit={handlePost} className="flex gap-3">
              <img src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop'} alt="" className="h-9 w-9 rounded-full object-cover flex-shrink-0" />
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share something with the community..."
                  className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 text-sm outline-none resize-none border border-transparent focus:border-amber-500/50 transition-colors min-h-[60px]"
                  rows={2}
                />
                <div className="flex justify-end mt-2">
                  <button
                    type="submit"
                    disabled={!postContent.trim() || isPosting}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isPosting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Posts */}
        <div className="space-y-4">
          {selectedCommunity.posts.length > 0 ? selectedCommunity.posts.map((post: any) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900"
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={post.author.avatarUrl} alt={post.author.name} className="h-8 w-8 rounded-full object-cover cursor-pointer" onClick={() => onViewProfile(post.author.username)} />
                <div>
                  <p className="text-sm font-semibold cursor-pointer" onClick={() => onViewProfile(post.author.username)}>{post.author.name}</p>
                  <p className="text-xs text-neutral-400">@{post.author.username}</p>
                </div>
                {post.isPinned && <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1"><Pin className="h-3 w-3" /> Pinned</span>}
              </div>
              <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">{post.content}</p>
              {post.media && post.media.length > 0 && (
                <div className="rounded-xl overflow-hidden mb-3">
                  <img src={post.media[0].url} alt="" className="w-full h-48 object-cover" />
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {post.likesCount}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" /> {post.commentsCount}</span>
              </div>
            </motion.div>
          )) : (
            <div className="text-center py-12 text-neutral-400">
              <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No posts yet. Be the first to share!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Communities</h2>
          <p className="text-sm text-neutral-500">Join interest-based groups and connect with like-minded people.</p>
        </div>
        <button
          onClick={() => {
            if (isGuest && onGuestPrompt) { onGuestPrompt('Creating communities'); return; }
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" /> Create
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl px-3 py-2">
        <Search className="h-4 w-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-sm outline-none flex-1 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400"
        />
      </div>

      {/* Community Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCommunities.map((community, idx) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => fetchCommunityDetails(community.slug)}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden cursor-pointer hover:shadow-lg hover:border-amber-500/20 transition-all bg-white dark:bg-neutral-900"
            >
              <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${community.cover_url})` }}>
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <img src={community.avatar_url} alt={community.name} className="h-10 w-10 rounded-xl border-2 border-white dark:border-neutral-900 object-cover bg-white" />
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-semibold text-sm">{community.name}</h3>
                  {community.is_private ? <Lock className="h-3 w-3 text-neutral-400" /> : <Globe className="h-3 w-3 text-neutral-400" />}
                </div>
                <p className="text-xs text-neutral-500 line-clamp-2 mb-3">{community.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-neutral-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {community.member_count}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {community.post_count}</span>
                  </div>
                  {community.isMember ? (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-amber-500/10 text-amber-500 flex items-center gap-1"><Check className="h-3 w-3" /> Member</span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500">Join</span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-neutral-400">
          <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No communities found.</p>
          <p className="text-xs mt-1">Create the first one!</p>
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl max-w-md w-full p-6 pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold">Create Community</h3>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"><X className="h-4 w-4" /></button>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Name</label>
                    <input value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 text-sm outline-none border border-transparent focus:border-amber-500/50 transition-colors" placeholder="Community name" required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Slug</label>
                    <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 text-sm">
                      <span className="text-neutral-400">lantern.com/c/</span>
                      <input value={createForm.slug} onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} className="bg-transparent outline-none flex-1" placeholder="my-community" required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-500 mb-1 block">Description</label>
                    <textarea value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} className="w-full bg-neutral-50 dark:bg-neutral-800 rounded-xl px-3 py-2 text-sm outline-none resize-none border border-transparent focus:border-amber-500/50 transition-colors" rows={3} placeholder="What is this community about?" />
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="private" checked={createForm.isPrivate} onChange={(e) => setCreateForm({ ...createForm, isPrivate: e.target.checked })} className="rounded border-neutral-300" />
                    <label htmlFor="private" className="text-sm text-neutral-500">Private community (invite-only)</label>
                  </div>
                  <button type="submit" disabled={isCreating} className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl transition-colors disabled:opacity-50 cursor-pointer">
                    {isCreating ? 'Creating...' : 'Create Community'}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
