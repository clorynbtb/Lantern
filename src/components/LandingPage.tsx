/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart, MessageCircle, Bookmark, Share2, Search, ArrowRight,
  Flame, Users, Globe, Sparkles, Shield, Zap, Moon, Sun,
  ChevronDown, ChevronUp, Check, X, ArrowUpRight,
  Image, Play, Star, Lock, Clock, Send, Hash, TrendingUp
} from 'lucide-react';
import { PostWithAuthor, UserSummary } from '../types.ts';

interface LandingPageProps {
  onNavigateToAuth: (view: 'login' | 'register') => void;
  onEnterGuestMode: () => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function LandingPage({ onNavigateToAuth, onEnterGuestMode, addToast }: LandingPageProps) {
  const [previewPosts, setPreviewPosts] = useState<PostWithAuthor[]>([]);
  const [previewStories, setPreviewStories] = useState<any[]>([]);
  const [previewHashtags, setPreviewHashtags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const [postsRes, exploreRes] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/explore')
        ]);
        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPreviewPosts(postsData.posts?.slice(0, 3) || []);
        }
        if (exploreRes.ok) {
          const exploreData = await exploreRes.json();
          setPreviewHashtags(exploreData.hashtags?.slice(0, 6) || []);
        }
      } catch (e) {
        console.error('Preview fetch failed', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPreview();
  }, []);

  const features = [
    { icon: <Flame className="h-5 w-5" />, title: 'Visual Stories', desc: 'Share moments that fade beautifully. 24h ephemeral stories with images, videos, and reactions.' },
    { icon: <Globe className="h-5 w-5" />, title: 'Public Discovery', desc: 'Explore trending posts, creators, and hashtags from around the world without an account.' },
    { icon: <Sparkles className="h-5 w-5" />, title: 'Premium Themes', desc: 'Switch between warm amber tones, dark slate, and custom themes. Every surface feels intentional.' },
    { icon: <Shield className="h-5 w-5" />, title: 'Privacy First', desc: 'Private profiles, granular controls, and end-to-end encrypted messaging. You own your data.' },
    { icon: <Users className="h-5 w-5" />, title: 'Communities', desc: 'Join or create interest-based communities with roles, rules, and moderation tools.' },
    { icon: <Zap className="h-5 w-5" />, title: 'Real-time', desc: 'Instant notifications, live typing indicators, and read receipts. Feel the presence of friends.' }
  ];

  const testimonials = [
    { name: 'Sophia Sterling', role: 'Photographer', text: 'Lantern is the most intentional social platform I have ever used. The warm design language makes every interaction feel human.' },
    { name: 'Marcus Chen', role: 'Designer', text: 'The theme engine is remarkable. I have never seen such a smooth, premium-feeling dark mode on a social app.' },
    { name: 'Aria Bloom', role: 'Writer', text: 'Guest mode is a brilliant touch. I could explore the community before deciding to join, and it felt natural.' }
  ];

  const faqs = [
    { q: 'What is Lantern?', a: 'Lantern is a premium social platform designed for creators, photographers, and communities. It combines ephemeral stories, real-time messaging, and rich content discovery in a warm, minimal interface.' },
    { q: 'Can I browse without an account?', a: 'Yes! Lantern supports full Guest Mode. You can browse public posts, explore trending content, search profiles, and preview themes without ever signing up.' },
    { q: 'How do stories work?', a: 'Stories are visual moments that disappear after 24 hours. You can upload images and videos, and viewers can react with emoji or reply via direct message.' },
    { q: 'Is my data private?', a: 'Absolutely. You can make your profile private, approve followers individually, and control who sees your posts. All messages are encrypted in transit.' },
    { q: 'What are the themes?', a: 'Lantern offers a curated theme engine with warm amber, calm slate, and dark premium palettes. Themes persist across sessions and adapt every UI surface.' },
    { q: 'Are there communities?', a: 'Yes. Lantern supports communities with roles, custom rules, pinned posts, and moderation tools. Join existing ones or create your own.' }
  ];

  const themePreview = [
    { name: 'Warm Amber', key: 'light', bg: 'bg-[#F5F0EB]', text: 'text-amber-900', accent: 'bg-amber-500' },
    { name: 'Dark Slate', key: 'dark', bg: 'bg-[#0F172A]', text: 'text-slate-100', accent: 'bg-amber-500' },
    { name: 'Midnight', key: 'midnight', bg: 'bg-[#0C0A09]', text: 'text-neutral-200', accent: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-[#F5F0EB] dark:bg-[#0C0A09] text-neutral-900 dark:text-neutral-100 font-sans">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#F5F0EB]/80 dark:bg-[#0C0A09]/80 backdrop-blur-xl border-b border-neutral-200/40 dark:border-neutral-800/40">
        <div className="max-w-6xl mx-auto h-16 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <svg className="h-[60%] w-[60%] text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2v2M5 7h14c0-2-3-3-7-3s-7 1-7 3zM6 7l2 11h8l2-11M10 7v11M14 7v11M8 18h8v2H8z" />
              </svg>
            </div>
            <span className="font-bold text-lg tracking-tight">Lantern</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onEnterGuestMode()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              Explore as Guest
            </button>
            <button
              onClick={() => onNavigateToAuth('login')}
              className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-200 hover:text-amber-600 dark:hover:text-amber-400 transition-colors rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800/50 cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-4 py-2 text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 -left-[10%] w-[40%] h-[40%] rounded-full bg-amber-500/10 blur-[100px]" />
          <div className="absolute bottom-1/4 -right-[10%] w-[50%] h-[50%] rounded-full bg-orange-500/10 blur-[120px]" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-6">
                <Sparkles className="h-3 w-3" />
                Now in public beta
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
                Share your light.
                <br />
                <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent">
                  Discover the world.
                </span>
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-xl mx-auto leading-relaxed">
                A calm, warm, and premium social space for creators, photographers, and communities. 
                Browse without boundaries. Connect with intention.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  onClick={() => onNavigateToAuth('register')}
                  className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xl shadow-amber-500/15 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Flame className="h-4 w-4" />
                  Create your space
                </button>
                <button
                  onClick={() => onEnterGuestMode()}
                  className="px-6 py-3.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Globe className="h-4 w-4" />
                  Explore as Guest
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-xs text-neutral-400 dark:text-neutral-500">
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-amber-500" /> Free to use</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-amber-500" /> No ads</span>
                <span className="flex items-center gap-1"><Check className="h-3 w-3 text-amber-500" /> Privacy-first</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Feed Preview Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Live from the community</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Browse real posts without signing up. Create an account to join the conversation.</p>
            </div>
            <button
              onClick={() => onEnterGuestMode()}
              className="hidden md:flex items-center gap-1 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
            >
              Explore all posts <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl bg-neutral-100 dark:bg-neutral-800 h-80 animate-pulse" />
              ))}
            </div>
          ) : previewPosts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {previewPosts.map((post, idx) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <div className="p-4 flex items-center gap-3">
                    <img src={post.author.avatarUrl} alt={post.author.name} className="h-8 w-8 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{post.author.name}</p>
                      <p className="text-xs text-neutral-400">@{post.author.username}</p>
                    </div>
                  </div>
                  {post.media && post.media.length > 0 && (
                    <div className="aspect-square bg-neutral-100 dark:bg-neutral-800">
                      <img src={post.media[0].url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-neutral-700 dark:text-neutral-300 line-clamp-3 mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-neutral-400 text-xs">
                      <span className="flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {post.likesCount}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" /> {post.commentsCount}</span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-neutral-400">
              <p>Posts will appear here once the community starts sharing.</p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for creators</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Every feature is designed with intention, warmth, and attention to the details that matter.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:shadow-lg hover:border-amber-500/20 dark:hover:border-amber-500/20 transition-all group"
              >
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-base mb-1">{f.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Theme Preview Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">A theme for every mood</h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-lg mx-auto">
              Switch between warm amber, dark slate, and premium midnight palettes. Every surface adapts.
            </p>
          </div>
          <div className="flex items-center justify-center gap-4 mb-8">
            {themePreview.map(t => (
              <button
                key={t.key}
                onClick={() => setActiveTheme(t.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  activeTheme === t.key
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="flex justify-center">
            <div className="w-full max-w-2xl rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <div className={`h-80 ${themePreview.find(t => t.key === activeTheme)?.bg} p-8 flex flex-col`}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="space-y-1.5">
                    <div className="h-3 w-32 rounded bg-neutral-200 dark:bg-neutral-700" />
                    <div className="h-2 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
                  </div>
                </div>
                <div className="space-y-3 mb-6 flex-1">
                  <div className="h-3 w-full rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-5/6 rounded bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-3 w-4/6 rounded bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                  <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Hashtags Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Trending topics</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Discover what the community is talking about right now.</p>
            </div>
          </div>
          {isLoading ? (
            <div className="flex gap-3 flex-wrap">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-10 w-28 rounded-xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : previewHashtags.length > 0 ? (
            <div className="flex gap-3 flex-wrap">
              {previewHashtags.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-colors cursor-pointer group"
                >
                  <Hash className="h-4 w-4 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold text-sm">{h.tag}</span>
                  <span className="text-xs text-neutral-400">{h.postCount} posts</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-neutral-400">
              <p>Hashtags will appear as the community creates content.</p>
            </div>
          )}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">What people say</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className="h-4 w-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4 leading-relaxed">{t.text}</p>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-neutral-400">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Questions & answers</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-5 text-left cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                >
                  <span className="font-semibold text-sm">{faq.q}</span>
                  {faqOpen === idx ? (
                    <ChevronUp className="h-4 w-4 text-neutral-400 flex-shrink-0 ml-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400 flex-shrink-0 ml-4" />
                  )}
                </button>
                <AnimatePresence>
                  {faqOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white/50 dark:bg-neutral-900/30">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to share your light?</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8 max-w-lg mx-auto">
            Join thousands of creators, photographers, and communities. No credit card required. No ads. Just connection.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => onNavigateToAuth('register')}
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-xl shadow-xl shadow-amber-500/15 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Flame className="h-4 w-4" />
              Start your journey
            </button>
            <button
              onClick={() => onEnterGuestMode()}
              className="px-8 py-3.5 bg-white dark:bg-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-700 text-neutral-900 dark:text-neutral-100 font-medium rounded-xl border border-neutral-200 dark:border-neutral-700 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Globe className="h-4 w-4" />
              Continue as Guest
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center">
                <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v2M5 7h14c0-2-3-3-7-3s-7 1-7 3zM6 7l2 11h8l2-11M10 7v11M14 7v11M8 18h8v2H8z" />
                </svg>
              </div>
              <span className="font-bold text-sm">Lantern</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-neutral-400 dark:text-neutral-500">
              <span className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer">Privacy</span>
              <span className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer">Terms</span>
              <span className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer">Security</span>
              <span className="hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors cursor-pointer">API</span>
            </div>
            <div className="text-xs text-neutral-400 dark:text-neutral-500">
              2026 Lantern Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
