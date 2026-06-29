/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Search, Heart, MessageCircle, UserPlus, Flame, Sparkles, Languages, Check, ArrowRight, Grid2x2 as Grid, TrendingUp, Eye, User as UserIcon, BookOpen } from 'lucide-react';
import { PostWithAuthor, UserSummary } from '../types.ts';
import ZenReadingModal from './ZenReadingModal.tsx';

interface ExploreSectionProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onViewProfile: (username: string) => void;
  currentUser: any;
  isGuest?: boolean;
  onGuestPrompt?: (action: string) => void;
}

export default function ExploreSection({
  token,
  addToast,
  onViewProfile,
  currentUser,
  isGuest,
  onGuestPrompt
}: ExploreSectionProps) {
  const [trendingPosts, setTrendingPosts] = useState<PostWithAuthor[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<UserSummary[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PostWithAuthor[]>([]);
  
  // Custom interactive modules for AI features
  const [translatedPostId, setTranslatedPostId] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState<{ [postId: string]: string }>({});
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  
  const [summarizedPostId, setSummarizedPostId] = useState<string | null>(null);
  const [summarizedText, setSummarizedText] = useState<{ [postId: string]: string }>({});
  const [isSummarizing, setIsSummarizing] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'All Discoveries' },
    { id: 'design', label: 'Design & Art', tags: ['geometry', 'creative', 'marcus.designs'] },
    { id: 'travel', label: 'Travel & Nature', tags: ['wanderlust', 'adventure', 'elena.wanderlust'] },
    { id: 'ideas', label: 'Tech & Ideas', tags: ['programming', 'lantern', 'ai'] }
  ];

  useEffect(() => {
    fetchExploreData();
    fetchSuggestions();
  }, [token]);

  const fetchExploreData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/explore', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setTrendingPosts(data.trendingPosts || []);
        setHashtags(data.hashtags || []);
      }
    } catch (err) {
      console.error('Explore fetch failed', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/users/suggested', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSuggestedUsers(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to fetch suggested creators', err);
    }
  };

  const handleSearchSubmit = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(queryToSearch)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResults(data.posts || []);
        addToast('success', `Found ${data.posts?.length || 0} posts matching "${queryToSearch}"`);
      }
    } catch (err) {
      console.error('Failed to search', err);
    } finally {
      setIsSearching(false);
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
        addToast('success', `Now following @${username}`);
        fetchSuggestions();
      }
    } catch (err) {
      console.error('Follow request failed', err);
    }
  };

  // --- MOCK AI ABSTRACT LAYER INTEGRATION ---
  const handleAITranslate = async (postId: string, content: string) => {
    if (translatedText[postId]) {
      setTranslatedPostId(translatedPostId === postId ? null : postId);
      return;
    }
    setIsTranslating(postId);
    try {
      // Abstract API translation gateway simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockTranslations: { [key: string]: string } = {
        'geometry': 'Exploring geometric structures and lines in architecture is fascinating. Look at this frame!',
        'adventure': 'Deep in the Norwegian fjords, you realize how tiny we are in nature. Highly recommend checking it out.',
        'creative': 'Creating beautiful minimal interfaces for developer experiences. Let me know what you think!'
      };
      // Find matching theme or fallback
      const foundKey = Object.keys(mockTranslations).find(k => content.toLowerCase().includes(k)) || 'creative';
      const translation = `[AI Translated - FR] « ${mockTranslations[foundKey]} »`;
      setTranslatedText({ ...translatedText, [postId]: translation });
      setTranslatedPostId(postId);
      addToast('info', 'AI translation nodes executed successfully.');
    } catch (e) {
      addToast('error', 'AI translator node failed.');
    } finally {
      setIsTranslating(null);
    }
  };

  const handleAISummarize = async (postId: string, content: string) => {
    if (summarizedText[postId]) {
      setSummarizedPostId(summarizedPostId === postId ? null : postId);
      return;
    }
    setIsSummarizing(postId);
    try {
      // Abstract AI summarization pipeline simulation
      await new Promise(resolve => setTimeout(resolve, 800));
      const bulletPoints = [
        '✨ Explores geometric layouts and raw color theory details.',
        '📷 Captured on location, showcasing negative space frames.',
        '🛠️ Uses clean modular principles for interactive visual design.'
      ];
      setSummarizedText({ ...summarizedText, [postId]: bulletPoints.join('\n') });
      setSummarizedPostId(postId);
      addToast('info', 'AI Summarizer output parsed.');
    } catch (e) {
      addToast('error', 'AI summarizer node failed.');
    } finally {
      setIsSummarizing(null);
    }
  };

  // Filter posts based on category
  const getFilteredPosts = () => {
    const list = searchQuery.trim() ? searchResults : trendingPosts;
    if (selectedCategory === 'all') return list;
    
    const cat = categories.find(c => c.id === selectedCategory);
    if (!cat || !cat.tags) return list;
    
    return list.filter(post => 
      post.tags.some(t => cat.tags.includes(t)) || 
      cat.tags.some(tag => post.author.username.toLowerCase().includes(tag))
    );
  };

  const postsToShow = getFilteredPosts();

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 text-left" id="explore-section-root">
      
      {/* Search and Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-theme-border pb-6" id="explore-header">
        <div>
          <h2 className="font-display text-2xl font-bold text-theme-text flex items-center gap-2">
            <Compass className="h-6 w-6 text-theme-primary animate-spin-slow" />
            <span>Discover Lantern Network</span>
          </h2>
          <p className="text-sm text-theme-muted mt-1 leading-relaxed">
            Uncover outstanding designs, photos, stories, and ideas from our global creators.
          </p>
        </div>

        {/* Explore Search Input */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit(searchQuery);
          }}
          className="relative w-full md:max-w-md"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, hashtags, or posts..."
            className="w-full pl-10.5 pr-20 py-2.5 text-sm bg-theme-secondary/30 hover:bg-theme-secondary/50 focus:bg-theme-card border border-theme-border rounded-xl outline-none focus:ring-1 focus:ring-theme-primary transition-all text-theme-text"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
          >
            Explore
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Filter Chips and Posts Grid */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Categories Horizontal Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none scrollbar-none" id="category-selector-bar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedTag(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-theme-primary text-white border-theme-primary shadow-sm'
                    : 'bg-theme-card text-theme-muted border-theme-border hover:text-theme-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Result Title */}
          {searchQuery.trim() !== '' && (
            <div className="flex justify-between items-center bg-theme-card p-4 rounded-xl border border-theme-border">
              <span className="text-xs font-semibold text-theme-text">
                Showing search results for "<span className="text-theme-primary">{searchQuery}</span>"
              </span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-xs text-theme-primary hover:underline font-bold"
              >
                Clear Search
              </button>
            </div>
          )}

          {/* Posts Gallery */}
          {isLoading || isSearching ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 4].map((num) => (
                <div key={num} className="p-4 rounded-2xl bg-theme-card border border-theme-border space-y-3 animate-pulse">
                  <div className="h-40 rounded-xl bg-theme-secondary/20" />
                  <div className="h-4 w-32 bg-theme-secondary/20 rounded" />
                  <div className="h-3 w-48 bg-theme-secondary/10 rounded" />
                </div>
              ))}
            </div>
          ) : postsToShow.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6" id="explore-grid-list">
              {postsToShow.map((post) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl bg-theme-card border border-theme-border shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-shadow"
                >
                  {/* Image/Media preview if exists */}
                  {post.media && post.media.length > 0 ? (
                    <div className="aspect-video w-full bg-theme-secondary/20 relative overflow-hidden">
                      <img
                        src={post.media[0].url}
                        alt="Featured discover asset"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-3 right-3 py-1 px-2.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
                        <span>Trending</span>
                      </div>
                    </div>
                  ) : (
                    <div className="h-1 bg-gradient-to-r from-theme-primary to-theme-accent" />
                  )}

                  {/* Body Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Author Info */}
                      <div className="flex items-center gap-2.5">
                        <img
                          src={post.author.avatarUrl}
                          alt={post.author.name}
                          onClick={() => onViewProfile(post.author.username)}
                          className="h-6.5 w-6.5 rounded-full object-cover border border-theme-border cursor-pointer"
                          referrerPolicy="no-referrer"
                        />
                        <div className="truncate">
                          <span 
                            onClick={() => onViewProfile(post.author.username)}
                            className="text-xs font-bold text-theme-text hover:underline cursor-pointer"
                          >
                            {post.author.name}
                          </span>
                          <span className="text-[10px] text-theme-muted ml-1.5 font-medium">@{post.author.username}</span>
                        </div>
                      </div>

                      {/* Content text */}
                      <p className="text-sm text-theme-text/90 line-clamp-3 leading-relaxed font-serif">
                        {post.content}
                      </p>

                      {/* Dynamic AI modules drawer overlay */}
                      <AnimatePresence>
                        {translatedPostId === post.id && translatedText[post.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 leading-relaxed font-serif text-left"
                          >
                            {translatedText[post.id]}
                          </motion.div>
                        )}

                        {summarizedPostId === post.id && summarizedText[post.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl text-xs text-amber-700 dark:text-amber-300 space-y-1 text-left"
                          >
                            <p className="font-bold text-[10px] text-amber-500 uppercase tracking-wide">AI Condensed Summarizer</p>
                            <p className="whitespace-pre-line leading-relaxed">{summarizedText[post.id]}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Inline tags list */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            onClick={() => {
                              setSearchQuery(`#${tag}`);
                              handleSearchSubmit(`#${tag}`);
                            }}
                            className="text-[10px] font-bold text-theme-primary bg-theme-primary/10 hover:bg-theme-primary/20 py-0.5 px-2 rounded-full cursor-pointer"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer Metrics & Modular AI helper keys */}
                    <div className="flex items-center justify-between pt-3 border-t border-theme-border/50 text-xs">
                      {/* Left: Like & comment indicators */}
                      <div className="flex items-center gap-3.5 text-theme-muted font-medium">
                        <span className="flex items-center gap-1 hover:text-rose-500 transition-colors">
                          <Heart className="h-3.5 w-3.5" />
                          <span>{post.likesCount}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3.5 w-3.5" />
                          <span>{post.commentsCount}</span>
                        </span>
                      </div>

                      {/* Right: Abstract AI integrations buttons (Modular) */}
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleAITranslate(post.id, post.content)}
                          className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 cursor-pointer flex items-center justify-center"
                          title="Translate Article"
                        >
                          {isTranslating === post.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-indigo-600/30 border-t-indigo-600" />
                          ) : (
                            <Languages className="h-3.5 w-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleAISummarize(post.id, post.content)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 cursor-pointer flex items-center justify-center"
                          title="Summarize Content"
                        >
                          {isSummarizing === post.id ? (
                            <div className="h-3.5 w-3.5 animate-spin rounded-full border border-amber-600/30 border-t-amber-600" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-theme-card border border-theme-border rounded-2xl">
              <Compass className="h-8 w-8 text-theme-muted mx-auto mb-2" />
              <span className="block text-xs font-bold text-theme-text">No Discoveries Here</span>
              <p className="text-[11px] text-theme-muted mt-1 max-w-xs mx-auto">
                No articles matches your filters yet. Reset options or clear search query.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Trending Tags & Suggested Creators */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Trending Hashtags Section */}
          <div className="p-5 rounded-2xl bg-theme-card border border-theme-border shadow-sm space-y-4" id="explore-trending-hashtags">
            <h3 className="font-display font-bold text-sm text-theme-text flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-theme-primary" />
              <span>Trending Tags</span>
            </h3>
            
            <div className="space-y-3">
              {hashtags.slice(0, 5).map((hash) => (
                <div 
                  key={hash.id}
                  onClick={() => {
                    setSearchQuery(`#${hash.tag}`);
                    handleSearchSubmit(`#${hash.tag}`);
                  }}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-theme-secondary/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-theme-primary/10 text-theme-primary flex items-center justify-center">
                      <span className="font-bold text-sm">#</span>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-theme-text">#{hash.tag}</p>
                      <p className="text-[10px] text-theme-muted font-medium">{hash.postCount} updates</p>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-theme-muted group-hover:text-theme-primary" />
                </div>
              ))}
            </div>
          </div>

          {/* Suggested Creators Section */}
          <div className="p-5 rounded-2xl bg-theme-card border border-theme-border shadow-sm space-y-4" id="explore-suggested-creators">
            <h3 className="font-display font-bold text-sm text-theme-text flex items-center gap-1.5">
              <UserIcon className="h-4.5 w-4.5 text-theme-primary" />
              <span>Rising Creators</span>
            </h3>

            <div className="space-y-3">
              {suggestedUsers.slice(0, 4).map((creator) => (
                <div 
                  key={creator.id}
                  className="flex items-center justify-between p-2 rounded-xl"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={creator.avatarUrl}
                      alt={creator.name}
                      onClick={() => onViewProfile(creator.username)}
                      className="h-8.5 w-8.5 rounded-full object-cover border border-theme-border cursor-pointer hover:opacity-90"
                      referrerPolicy="no-referrer"
                    />
                    <div className="truncate text-left max-w-[120px]">
                      <h5 
                        onClick={() => onViewProfile(creator.username)}
                        className="text-xs font-bold text-theme-text hover:underline cursor-pointer truncate"
                      >
                        {creator.name}
                      </h5>
                      <p className="text-[10px] text-theme-muted font-medium truncate">@{creator.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleFollowUser(creator.id, creator.username)}
                    className="p-1.5 bg-theme-primary/10 hover:bg-theme-primary hover:text-white rounded-lg text-theme-primary text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    <span>Follow</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
