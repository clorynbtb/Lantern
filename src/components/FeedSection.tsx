/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, MessageCircle, Bookmark, Send, MoveHorizontal as MoreHorizontal, Image, Plus, Trash2, ShieldAlert, BookOpen } from 'lucide-react';
import { PostWithAuthor, CommentWithAuthor, UserSummary } from '../types.ts';
import CreatePost from './CreatePost.tsx';
import StoriesModal from './StoriesModal.tsx';
import ZenReadingModal from './ZenReadingModal.tsx';

interface FeedSectionProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string; avatarUrl?: string };
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onViewProfile: (username: string) => void;
  isAdmin: boolean;
  isGuest?: boolean;
  onGuestPrompt?: (action: string) => void;
}

export default function FeedSection({ token, currentUser, addToast, onViewProfile, isAdmin, isGuest, onGuestPrompt }: FeedSectionProps) {
  const [posts, setPosts] = useState<PostWithAuthor[]>([]);
  const [suggestions, setSuggestions] = useState<UserSummary[]>([]);
  const [groupedStories, setGroupedStories] = useState<any[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  
  // Create Post states
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // Active commenting states
  const [activeComments, setActiveComments] = useState<{ [postId: string]: string }>({});
  const [expandedComments, setExpandedComments] = useState<{ [postId: string]: CommentWithAuthor[] }>({});
  const [showCommentsFor, setShowCommentsFor] = useState<{ [postId: string]: boolean }>({});

  // Stories modal light-box states
  const [activeStoryGroup, setActiveStoryGroup] = useState<any | null>(null);
  const [activeStoryGroupIndex, setActiveStoryGroupIndex] = useState<number>(0);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);

  // Zen Reading overlay state
  const [activeZenPost, setActiveZenPost] = useState<PostWithAuthor | null>(null);

  // Sync Zen post when likes or comments update
  useEffect(() => {
    if (activeZenPost) {
      const updated = posts.find(p => p.id === activeZenPost.id);
      if (updated) {
        setActiveZenPost(updated);
      }
    }
  }, [posts, activeZenPost?.id]);

  useEffect(() => {
    fetchFeed();
    fetchSuggestions();
    fetchStories();

    // Catch sandbox developer mode reset event triggers to instantly refresh visual cards
    const handleSandboxUpdate = () => {
      fetchFeed();
      fetchSuggestions();
      fetchStories();
    };
    window.addEventListener('sandbox_data_refreshed', handleSandboxUpdate);

    return () => {
      window.removeEventListener('sandbox_data_refreshed', handleSandboxUpdate);
    };
  }, [token]);

  const fetchFeed = async () => {
    setIsLoadingPosts(true);
    try {
      const response = await fetch('/api/posts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/users/suggested', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSuggestions(data.suggestions);
      }
    } catch (err) {
      console.error('Failed to fetch suggested users', err);
    }
  };

  const fetchStories = async () => {
    try {
      const response = await fetch('/api/stories', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setGroupedStories(data.groupedStories);
      }
    } catch (err) {
      console.error('Failed to fetch stories', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest && onGuestPrompt) { onGuestPrompt('Creating posts'); return; }
    if (!newPostContent.trim() && !newPostMedia.trim()) return;

    setIsCreatingPost(true);
    try {
      const mediaUrls = newPostMedia.trim() ? [newPostMedia.trim()] : [];
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: newPostContent, mediaUrls }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setPosts([data.post, ...posts]);
        setNewPostContent('');
        setNewPostMedia('');
        addToast('success', 'Your story has been lit! Post created.');
      } else {
        addToast('error', data.error || 'Failed to create post');
      }
    } catch (err) {
      addToast('error', 'Network failure while posting.');
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleToggleLike = async (postId: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Liking posts'); return; }
    // Store original state for potential rollback
    const originalPosts = [...posts];
    let nextLiked = false;

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const wasLiked = p.isLiked || false;
          nextLiked = !wasLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: Math.max(0, p.likesCount + (nextLiked ? 1 : -1)),
          };
        }
        return p;
      })
    );

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to like post');
      }
      // Re-sync with exact backend state to guarantee accuracy
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isLiked: data.liked,
              likesCount: data.count
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error('Failed to like post', err);
      setPosts(originalPosts);
      addToast('error', 'Unable to like post. Reverting changes.');
    }
  };

  const handleToggleSave = async (postId: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Saving bookmarks'); return; }
    // Store original state for potential rollback
    const originalPosts = [...posts];
    let nextSaved = false;

    setPosts(prevPosts =>
      prevPosts.map(p => {
        if (p.id === postId) {
          const wasSaved = p.isSaved || false;
          nextSaved = !wasSaved;
          return {
            ...p,
            isSaved: nextSaved
          };
        }
        return p;
      })
    );

    // Show instant visual confirmation
    addToast('success', nextSaved ? 'Post saved to bookmarks' : 'Removed from bookmarks');

    try {
      const response = await fetch(`/api/posts/${postId}/save`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to save post');
      }
      // Sync precise state from server response
      setPosts(prevPosts =>
        prevPosts.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              isSaved: data.saved
            };
          }
          return p;
        })
      );
    } catch (err: any) {
      console.error('Failed to save post', err);
      setPosts(originalPosts);
      addToast('error', 'Unable to bookmark post. Reverting changes.');
    }
  };

  const handleFollowUser = async (userId: string, username: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Following users'); return; }
    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        fetchSuggestions();
        fetchFeed();
        addToast('success', `You are now following @${username}`);
      }
    } catch (err) {
      console.error('Failed to follow', err);
    }
  };

  const handleAddComment = async (postId: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Commenting'); return; }
    const text = activeComments[postId];
    if (!text || !text.trim()) return;

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });
      const data = await response.json();
      if (response.ok) {
        setActiveComments({ ...activeComments, [postId]: '' });
        
        // Update local comment count
        setPosts(posts.map(p => p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
        
        // Update loaded comments
        const currentComments = expandedComments[postId] || [];
        setExpandedComments({
          ...expandedComments,
          [postId]: [...currentComments, data.comment]
        });
        setShowCommentsFor({ ...showCommentsFor, [postId]: true });
      }
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const toggleViewComments = async (postId: string) => {
    if (showCommentsFor[postId]) {
      setShowCommentsFor({ ...showCommentsFor, [postId]: false });
      return;
    }

    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setExpandedComments({ ...expandedComments, [postId]: data.comments });
        setShowCommentsFor({ ...showCommentsFor, [postId]: true });
      }
    } catch (err) {
      console.error('Failed to load comments', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Deleting posts'); return; }
    if (!window.confirm('Are you absolutely sure you want to remove this post?')) return;

    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        setPosts(posts.filter(p => p.id !== postId));
        addToast('success', 'Post removed from feed successfully.');
      }
    } catch (err) {
      console.error('Failed to delete post', err);
    }
  };

  const handleReportPost = async (postId: string) => {
    if (isGuest && onGuestPrompt) { onGuestPrompt('Reporting content'); return; }
    const reason = window.prompt('Please enter a short reason for reporting this content:');
    if (!reason || !reason.trim()) return;

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetType: 'post',
          targetId: postId,
          reason: reason.trim()
        }),
      });
      const data = await response.json();
      if (response.ok) {
        addToast('success', 'Thank you! Content reported successfully.');
      } else {
        addToast('error', data.error || 'Failed to file report');
      }
    } catch (err) {
      console.error('Failed to report post', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full max-w-6xl mx-auto" id="feed-section-root">
      {/* Feed Area & Stories */}
      <div className="lg:col-span-8 flex flex-col gap-6" id="feed-area-container">
        
        {/* Stories Horizontal Tray */}
        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center gap-4 overflow-x-auto select-none" id="stories-tray">
          <div
            onClick={() => {
              if (isGuest && onGuestPrompt) { onGuestPrompt('Creating stories'); return; }
              setActiveStoryGroup(null);
              setIsStoriesModalOpen(true);
            }}
            className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
            id="create-story-bubble"
          >
            <div className="h-14 w-14 rounded-full border border-theme-border flex items-center justify-center relative bg-theme-secondary/20 hover:border-theme-primary transition-colors">
              <Plus className="h-6 w-6 text-theme-muted hover:text-theme-primary transition-colors" />
            </div>
            <span className="text-xs text-theme-muted font-medium">Your Story</span>
          </div>

          {groupedStories.map((group, index) => (
            <div
              key={index}
              onClick={() => {
                setActiveStoryGroup(group);
                setActiveStoryGroupIndex(index);
                setIsStoriesModalOpen(true);
              }}
              className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0"
              id={`story-bubble-${group.author.id}`}
            >
              <div className="h-14 w-14 rounded-full p-[2px] bg-gradient-to-tr from-theme-primary to-theme-accent">
                <img
                  src={group.author.avatarUrl}
                  alt={group.author.name}
                  className="h-full w-full object-cover rounded-full border-2 border-theme-card"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="text-xs text-theme-text font-medium truncate max-w-[65px]">
                {group.author.username}
              </span>
            </div>
          ))}
        </div>

        {/* Stories Player and Creator overlay */}
        {isStoriesModalOpen && (
          <StoriesModal
            token={token}
            addToast={addToast}
            onClose={() => setIsStoriesModalOpen(false)}
            currentUser={currentUser}
            storiesGroup={activeStoryGroup}
            storiesGroupsList={groupedStories}
            activeGroupIndex={activeStoryGroupIndex}
            onRefreshStories={fetchStories}
          />
        )}

        {/* Zen Reading Modal overlay */}
        {activeZenPost && (
          <ZenReadingModal
            post={activeZenPost}
            onClose={() => setActiveZenPost(null)}
            token={token}
            currentUser={currentUser}
            addToast={addToast}
            onToggleLike={handleToggleLike}
            onToggleSave={handleToggleSave}
          />
        )}

        {/* Create Post Component */}
        <CreatePost
          token={token}
          currentUser={currentUser}
          addToast={addToast}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
          }}
        />

        {isLoadingPosts ? (
          <div className="space-y-6" id="feed-skeletons">
            {[1, 2, 3].map((num) => (
              <motion.div
                key={num}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: num * 0.15,
                }}
                className="p-5 rounded-3xl bg-theme-card border border-theme-border shadow-sm flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-theme-secondary/40 animate-pulse" />
                    <div className="space-y-1.5">
                      <div className="h-3 w-28 rounded bg-theme-secondary/40 animate-pulse" />
                      <div className="h-2.5 w-20 rounded bg-theme-secondary/20 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-8 w-8 rounded bg-theme-secondary/20 animate-pulse" />
                </div>
                <div className="space-y-2 py-1">
                  <div className="h-3 w-full rounded bg-theme-secondary/40 animate-pulse" />
                  <div className="h-3 w-[92%] rounded bg-theme-secondary/40 animate-pulse" />
                  <div className="h-3 w-[78%] rounded bg-theme-secondary/40 animate-pulse" />
                </div>
                {num === 1 && (
                  <div className="h-44 rounded-xl bg-theme-secondary/20 animate-pulse w-full" />
                )}
                <div className="border-t border-theme-border pt-3 flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="h-3.5 w-16 rounded bg-theme-secondary/40 animate-pulse" />
                    <div className="h-3.5 w-20 rounded bg-theme-secondary/40 animate-pulse" />
                  </div>
                  <div className="h-3.5 w-12 rounded bg-theme-secondary/40 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Dynamic Post Feed list */
          <div className="space-y-6" id="post-feed-list">
            <AnimatePresence>
              {posts.map((post) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className="p-5 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex flex-col gap-4"
                id={`post-card-${post.id}`}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author.avatarUrl}
                      alt={post.author.name}
                      onClick={() => onViewProfile(post.author.username)}
                      className="h-9 w-9 rounded-full object-cover border border-theme-border cursor-pointer hover:opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4
                        onClick={() => onViewProfile(post.author.username)}
                        className="text-sm font-semibold text-theme-text hover:text-theme-primary hover:underline cursor-pointer transition-all"
                      >
                        {post.author.name}
                      </h4>
                      <span className="text-xs text-theme-muted">
                        @{post.author.username} • {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Dropdown simulation / Delete & Report */}
                  <div className="flex items-center gap-1">
                    {(isAdmin || post.userId === currentUser.id) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    {post.userId !== currentUser.id && (
                      <button
                        onClick={() => handleReportPost(post.id)}
                        className="p-2 text-theme-muted hover:text-theme-primary hover:bg-theme-secondary/40 rounded-lg transition-colors cursor-pointer"
                        title="Report Content"
                      >
                        <ShieldAlert className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-2">
                  <p 
                    onClick={() => setActiveZenPost(post)}
                    className="font-serif text-[15px] sm:text-base text-theme-text leading-relaxed whitespace-pre-line cursor-pointer hover:text-theme-primary/95 transition-colors"
                    title="Click to open in elegant Zen Reading mode"
                  >
                    {post.content}
                  </p>
                  
                  <div 
                    onClick={() => setActiveZenPost(post)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-theme-secondary/15 hover:bg-theme-primary/10 text-[10px] font-bold text-theme-muted hover:text-theme-primary transition-all cursor-pointer uppercase tracking-wider select-none"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Mindful reading</span>
                  </div>
                </div>

                {/* Media Image Attachment */}
                {post.media && post.media.length > 0 && (
                  <div className="rounded-xl overflow-hidden bg-theme-secondary/20 max-h-[460px] flex items-center justify-center border border-theme-border">
                    <img
                      src={post.media[0].url}
                      alt="Attached media file"
                      className="w-full h-full object-cover hover:scale-101 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                )}

                {/* Toolbar Controls */}
                <div className="border-t border-b border-theme-border py-2.5 flex items-center justify-between text-theme-muted">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors group ${
                        post.isLiked ? 'text-theme-primary font-bold' : 'hover:text-theme-text'
                      }`}
                    >
                      <motion.span
                        key={post.isLiked ? 'liked' : 'unliked'}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: [0.8, 1.25, 1] }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="inline-flex items-center"
                      >
                        <Heart className={`h-4.5 w-4.5 group-hover:scale-110 transition-transform ${post.isLiked ? 'fill-current text-theme-primary' : ''}`} />
                      </motion.span>
                      <span>{post.likesCount} Likes</span>
                    </button>

                    <button
                      onClick={() => toggleViewComments(post.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer hover:text-theme-text transition-colors group"
                    >
                      <MessageCircle className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                      <span>{post.commentsCount} Comments</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleToggleSave(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors group ${
                      post.isSaved ? 'text-theme-primary font-bold' : 'hover:text-theme-text'
                    }`}
                  >
                    <motion.span
                      key={post.isSaved ? 'saved' : 'unsaved'}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: [0.8, 1.25, 1] }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="inline-flex items-center"
                    >
                      <Bookmark className={`h-4.5 w-4.5 group-hover:scale-110 transition-transform ${post.isSaved ? 'fill-current text-theme-primary' : ''}`} />
                    </motion.span>
                    <span>{post.isSaved ? 'Saved' : 'Save'}</span>
                  </button>
                </div>

                {/* Comments Section Slot */}
                {showCommentsFor[post.id] && (
                  <div className="space-y-4 pt-1" id={`comments-expanded-${post.id}`}>
                    <div className="space-y-3" id={`comments-list-${post.id}`}>
                      {(expandedComments[post.id] || []).map((c) => (
                        <div key={c.id} className="flex gap-3 text-sm items-start py-2.5 border-b border-theme-border/20 last:border-b-0 px-1">
                          <img
                            src={c.author.avatarUrl}
                            className="h-7 w-7 rounded-full object-cover border border-theme-border"
                            alt="Avatar"
                          />
                          <div className="flex-grow">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-theme-text hover:underline cursor-pointer text-xs" onClick={() => onViewProfile(c.author.username)}>
                                {c.author.name}
                              </span>
                              <span className="text-[10px] text-theme-muted">
                                @{c.author.username} • {new Date(c.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-theme-text/90 mt-1 font-normal text-xs sm:text-[13px] leading-relaxed">
                              {c.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Submit Comment Form */}
                    <div className="flex gap-2.5 items-center mt-3">
                      <input
                        type="text"
                        placeholder="Add a custom comment..."
                        value={activeComments[post.id] || ''}
                        onChange={(e) => setActiveComments({ ...activeComments, [post.id]: e.target.value })}
                        className="flex-grow text-xs px-3 py-2 bg-theme-secondary/40 border border-theme-border rounded-xl text-theme-text placeholder-theme-muted outline-none focus:border-theme-primary"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!activeComments[post.id]?.trim()}
                        className="p-2 bg-theme-primary text-white rounded-xl hover:bg-theme-primary-hover disabled:opacity-40 cursor-pointer"
                      >
                        <Send className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.article>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>

      {/* Suggested Creators & Guidelines (Facebook Sidebar style) */}
      <div className="lg:col-span-4 flex flex-col gap-6" id="suggested-sidebar">
        
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center justify-between" id="sidebar-user-header">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full overflow-hidden border border-theme-border">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
                alt="Avatar"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-theme-text">{currentUser.name}</h4>
              <span className="text-xs text-theme-muted">@{currentUser.username}</span>
            </div>
          </div>
          <button
            onClick={() => onViewProfile(currentUser.username)}
            className="text-xs font-semibold text-theme-primary hover:text-theme-primary-hover cursor-pointer"
          >
            My Profile
          </button>
        </div>

        {/* Suggested Creators */}
        <div className="p-5 rounded-2xl bg-theme-card border border-theme-border shadow-sm space-y-4" id="sidebar-suggestions">
          <h4 className="text-xs font-bold uppercase tracking-wider text-theme-muted">Suggested Creators</h4>
          
          <div className="space-y-3">
            {suggestions.map((sug) => (
              <div key={sug.id} className="flex items-center justify-between gap-2" id={`suggestion-row-${sug.id}`}>
                <div className="flex items-center gap-2.5">
                  <img
                    src={sug.avatarUrl}
                    alt={sug.name}
                    className="h-8.5 w-8.5 rounded-full object-cover border border-theme-border cursor-pointer"
                    onClick={() => onViewProfile(sug.username)}
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h5
                      onClick={() => onViewProfile(sug.username)}
                      className="text-xs font-bold text-theme-text hover:underline cursor-pointer truncate max-w-[120px]"
                    >
                      {sug.name}
                    </h5>
                    <span className="text-[10px] text-theme-muted block truncate max-w-[120px]">@{sug.username}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleFollowUser(sug.id, sug.username)}
                  className="py-1 px-3 bg-theme-primary/10 hover:bg-theme-primary text-theme-primary hover:text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Brand Meta */}
        <div className="px-4 text-[10px] text-neutral-400 leading-relaxed font-medium space-y-2 select-none" id="sidebar-meta">
          <p>
            About • Help • API • Jobs • Privacy • Terms • Locations • Language
          </p>
          <p>© 2026 LANTERN SOCIAL FROM GOOGLE AI STUDIO</p>
        </div>
      </div>
    </div>
  );
}
