/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Volume2,
  VolumeX,
  Type,
  Plus,
  Minus,
  Sparkles,
  Heart,
  Bookmark,
  Share2,
  Calendar,
  MessageCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { PostWithAuthor, CommentWithAuthor } from '../types.ts';

interface ZenReadingModalProps {
  post: PostWithAuthor;
  onClose: () => void;
  token: string;
  currentUser: any;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onToggleLike?: (postId: string) => void;
  onToggleSave?: (postId: string) => void;
}

export default function ZenReadingModal({
  post,
  onClose,
  token,
  currentUser,
  addToast,
  onToggleLike,
  onToggleSave
}: ZenReadingModalProps) {
  const [fontSize, setFontSize] = useState<number>(18); // default px
  const [readTheme, setReadTheme] = useState<'paper' | 'sepia' | 'obsidian'>('paper');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [comments, setComments] = useState<CommentWithAuthor[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const speechUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Calculate Reading Time
  const wordsCount = post.content.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordsCount / 200));

  // Fetch comments for detailed sidebar
  useEffect(() => {
    fetchComments();
    
    // Track reading scroll progress
    const handleScroll = () => {
      if (contentContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = contentContainerRef.current;
        const totalHeight = scrollHeight - clientHeight;
        if (totalHeight > 0) {
          const progress = (scrollTop / totalHeight) * 100;
          setScrollProgress(progress);
        }
      }
    };

    const container = contentContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      // Stop voice if playing
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (e) {
      console.error('Failed to load comments in Zen mode', e);
    }
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      const response = await fetch(`/api/posts/${post.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ content: commentText.trim() })
      });
      const data = await response.json();
      if (response.ok) {
        setComments(prev => [...prev, data.comment]);
        setCommentText('');
        addToast('success', 'Your reflection has been added to the post.');
      } else {
        addToast('error', data.error || 'Failed to submit reflection.');
      }
    } catch (err) {
      addToast('error', 'Failed to connect to reflections database.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSpeechToggle = () => {
    if (!window.speechSynthesis) {
      addToast('info', 'Text-to-speech is not supported in your current browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      addToast('info', 'Zen narration paused.');
    } else {
      window.speechSynthesis.cancel(); // clear previous
      
      // Clean content from hashtags/links for nicer reading
      const cleanContent = post.content.replace(/#\w+/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(
        `Article by ${post.author.name}. ${cleanContent}`
      );
      
      utterance.onend = () => {
        setIsPlayingAudio(false);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
      };

      // Set elegant low pitch and moderate rate for high-end feeling
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      
      // Try to find a premium neural or standard local voice
      const voices = window.speechSynthesis.getVoices();
      const premiumVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Natural') || 
        v.name.includes('Premium')
      );
      if (premiumVoice) utterance.voice = premiumVoice;

      speechUtteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
      addToast('success', 'Now playing audio narration of the article.');
    }
  };

  const handleCopyLink = () => {
    const fakeUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(fakeUrl);
    addToast('success', 'Aesthetic story link copied to clipboard!');
  };

  // Aesthetic Themes definition
  const themesStyles = {
    paper: {
      bg: 'bg-amber-50/95 dark:bg-neutral-900/95',
      card: 'bg-white dark:bg-neutral-800/50',
      border: 'border-amber-200/40 dark:border-neutral-800',
      text: 'text-neutral-800 dark:text-neutral-100',
      muted: 'text-neutral-500 dark:text-neutral-400',
      accent: 'text-amber-700 dark:text-amber-400'
    },
    sepia: {
      bg: 'bg-[#f4ebd0]',
      card: 'bg-[#faf3e0]',
      border: 'border-[#e6d5b8]',
      text: 'text-[#433d3c]',
      muted: 'text-[#877265]',
      accent: 'text-[#a35d46]'
    },
    obsidian: {
      bg: 'bg-zinc-950/98',
      card: 'bg-zinc-900/50',
      border: 'border-zinc-800',
      text: 'text-zinc-200',
      muted: 'text-zinc-500',
      accent: 'text-amber-500'
    }
  };

  const activeTheme = themesStyles[readTheme];

  return (
    <div 
      className={`fixed inset-0 z-50 ${activeTheme.bg} backdrop-blur-md flex flex-col md:flex-row transition-all duration-300`}
      id="zen-reading-root"
    >
      {/* Top Reading Progress Bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-neutral-200/20 z-50 overflow-hidden">
        <div 
          className="h-full bg-theme-primary transition-all duration-100" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Main typographic content (Left column in desktop) */}
      <div 
        ref={contentContainerRef}
        className="flex-1 overflow-y-auto px-6 py-12 md:py-20 md:px-16 flex flex-col items-center custom-scrollbar"
        id="zen-reading-viewport"
      >
        <div className="w-full max-w-2xl space-y-8 text-left">
          
          {/* Top navigation actions */}
          <div className="flex justify-between items-center select-none border-b border-theme-border/20 pb-4">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border border-theme-border/30 text-xs font-bold hover:bg-theme-secondary/20 transition-all flex items-center gap-1.5 cursor-pointer text-theme-text"
              id="zen-close-button"
            >
              <X className="h-4 w-4" />
              <span>Exit Zen View</span>
            </button>

            {/* Typography adjustments widget */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleSpeechToggle}
                className={`p-2 rounded-xl border border-theme-border/30 transition-all cursor-pointer ${
                  isPlayingAudio ? 'bg-amber-500 text-white border-amber-500' : 'hover:bg-theme-secondary/20 text-theme-text'
                }`}
                title="Listen to Article"
              >
                {isPlayingAudio ? <Volume2 className="h-4.5 w-4.5" /> : <VolumeX className="h-4.5 w-4.5" />}
              </button>

              <div className="h-8 w-px bg-theme-border/40" />

              {/* Font Resizing keys */}
              <button
                onClick={() => setFontSize(prev => Math.max(14, prev - 1))}
                className="p-1.5 hover:bg-theme-secondary/20 rounded-lg text-theme-text"
                title="Decrease Text Size"
              >
                <Minus className="h-4 w-4" />
              </button>
              <Type className="h-3.5 w-3.5 text-theme-muted" />
              <button
                onClick={() => setFontSize(prev => Math.min(26, prev + 1))}
                className="p-1.5 hover:bg-theme-secondary/20 rounded-lg text-theme-text"
                title="Increase Text Size"
              >
                <Plus className="h-4 w-4" />
              </button>

              <div className="h-8 w-px bg-theme-border/40" />

              {/* Reading presets selection */}
              <div className="flex gap-1 bg-theme-secondary/20 p-1 rounded-xl border border-theme-border/30">
                {(['paper', 'sepia', 'obsidian'] as const).map((themeOpt) => (
                  <button
                    key={themeOpt}
                    onClick={() => setReadTheme(themeOpt)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      readTheme === themeOpt 
                        ? 'bg-theme-primary text-white shadow-sm' 
                        : 'text-theme-muted hover:text-theme-text'
                    }`}
                  >
                    {themeOpt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Article Header block */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={post.author.avatarUrl}
                alt={post.author.name}
                className="h-11 w-11 rounded-full object-cover border border-theme-border"
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className={`font-sans font-bold text-base ${activeTheme.text}`}>{post.author.name}</h3>
                <p className={`text-xs ${activeTheme.muted}`}>@{post.author.username}</p>
              </div>
              
              <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-theme-primary/10 rounded-full text-theme-primary text-[10px] font-bold">
                <BookOpen className="h-3.5 w-3.5 animate-pulse" />
                <span>Zen Edition</span>
              </div>
            </div>

            {/* Read estimation and timestamp details */}
            <div className={`flex flex-wrap gap-4 text-xs ${activeTheme.muted} pt-2 font-mono`}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{new Date(post.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</span>
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{readingTimeMinutes} min read ({wordsCount} words)</span>
              </span>
            </div>
          </div>

          {/* Large Image illustration block if present */}
          {post.media && post.media.length > 0 && (
            <div className="rounded-2xl overflow-hidden shadow-md max-h-[400px] border border-theme-border/10">
              <img
                src={post.media[0].url}
                alt="Aesthetic layout frame"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Main Article Content */}
          <article 
            className="font-serif leading-relaxed text-left pb-16 pt-4"
            style={{ fontSize: `${fontSize}px` }}
          >
            <p className={`whitespace-pre-line tracking-wide ${activeTheme.text} selection:bg-amber-200 selection:text-neutral-900`}>
              {post.content}
            </p>
          </article>

          {/* Minimal Interaction toolbar */}
          <div className="flex items-center justify-between border-t border-theme-border/20 pt-6">
            <div className="flex gap-4">
              {onToggleLike && (
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-theme-border/30 hover:bg-theme-secondary/20 cursor-pointer ${
                    post.isLiked ? 'text-theme-primary font-bold bg-theme-primary/10' : 'text-theme-muted'
                  }`}
                >
                  <Heart className={`h-4.5 w-4.5 ${post.isLiked ? 'fill-current text-theme-primary' : ''}`} />
                  <span>{post.likesCount} Likes</span>
                </button>
              )}

              {onToggleSave && (
                <button
                  onClick={() => onToggleSave(post.id)}
                  className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-theme-border/30 hover:bg-theme-secondary/20 cursor-pointer ${
                    post.isSaved ? 'text-theme-primary font-bold bg-theme-primary/10' : 'text-theme-muted'
                  }`}
                >
                  <Bookmark className={`h-4.5 w-4.5 ${post.isSaved ? 'fill-current text-theme-primary' : ''}`} />
                  <span>{post.isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl transition-all border border-theme-border/30 hover:bg-theme-secondary/20 text-theme-muted cursor-pointer"
            >
              <Share2 className="h-4.5 w-4.5" />
              <span>Share Link</span>
            </button>
          </div>

        </div>
      </div>

      {/* Reflections Sidebar (Right column in desktop) */}
      <div 
        className={`w-full md:w-[380px] border-t md:border-t-0 md:border-l ${activeTheme.border} ${activeTheme.card} flex flex-col h-[400px] md:h-full`}
        id="zen-reflections-panel"
      >
        <div className="p-5 border-b border-theme-border/20 flex justify-between items-center select-none bg-theme-secondary/5">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-4.5 w-4.5 text-theme-primary" />
            <h4 className="font-sans font-bold text-sm text-theme-text">Reflections ({comments.length})</h4>
          </div>
          <span className="text-[10px] uppercase font-bold text-theme-muted font-mono">Warm Discourse</span>
        </div>

        {/* Comments scrolling thread */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4 text-left custom-scrollbar">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div 
                key={comment.id}
                className="p-3.5 bg-theme-secondary/5 rounded-2xl border border-theme-border/35 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={comment.author.avatarUrl}
                    alt={comment.author.name}
                    className="h-5.5 w-5.5 rounded-full object-cover border border-theme-border"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate">
                    <span className="text-xs font-bold text-theme-text">{comment.author.name}</span>
                    <span className="text-[10px] text-theme-muted ml-1.5">@{comment.author.username}</span>
                  </div>
                </div>
                <p className="text-xs text-theme-text/90 leading-relaxed font-sans pl-1">
                  {comment.content}
                </p>
                <p className="text-[9px] text-theme-muted text-right font-mono">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-theme-muted flex flex-col items-center justify-center space-y-1">
              <Sparkles className="h-5 w-5 text-theme-muted/50" />
              <p className="text-xs font-semibold">No reflections yet.</p>
              <p className="text-[10px]">Be the first to share your mindful thought.</p>
            </div>
          )}
        </div>

        {/* Input box to add comment */}
        <form 
          onSubmit={handlePostComment}
          className="p-4 bg-theme-secondary/5 border-t border-theme-border/20 flex gap-2 items-center"
        >
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Write your reflection..."
            className="flex-grow px-4 py-2.5 text-xs bg-theme-card hover:bg-theme-secondary/35 border border-theme-border/40 rounded-xl outline-none focus:ring-1 focus:ring-theme-primary text-theme-text transition-all"
          />
          <button
            type="submit"
            disabled={isSubmittingComment || !commentText.trim()}
            className="px-3.5 py-2.5 bg-theme-primary hover:bg-theme-primary-hover text-white rounded-xl text-xs font-bold cursor-pointer transition-all disabled:opacity-40"
          >
            {isSubmittingComment ? 'Posting...' : 'Share'}
          </button>
        </form>
      </div>

    </div>
  );
}
