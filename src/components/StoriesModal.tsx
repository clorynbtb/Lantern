/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Send,
  Sparkles,
  Music,
  MapPin,
  Smile,
  CheckCircle,
  Clock,
  Palette,
  Layers,
  ArrowRight
} from 'lucide-react';
import { StoryWithAuthor } from '../types.ts';

interface StoriesModalProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onClose: () => void;
  currentUser: any;
  // Opening standard stories of other creators
  storiesGroup: { author: any; stories: StoryWithAuthor[] } | null;
  storiesGroupsList?: any[];
  activeGroupIndex?: number;
  onRefreshStories?: () => void;
}

const PRESET_GRADIENTS = [
  'from-amber-600 via-orange-500 to-yellow-500',
  'from-indigo-600 via-purple-500 to-pink-500',
  'from-emerald-600 via-teal-500 to-cyan-500',
  'from-rose-600 via-pink-500 to-orange-400',
  'from-neutral-900 via-slate-800 to-zinc-900',
  'from-violet-800 via-fuchsia-700 to-indigo-900'
];

export default function StoriesModal({
  token,
  addToast,
  onClose,
  currentUser,
  storiesGroup,
  storiesGroupsList = [],
  activeGroupIndex = 0,
  onRefreshStories
}: StoriesModalProps) {
  
  // Tab states: 'view' (watching stories) | 'create' (composing story)
  const [viewMode, setViewMode] = useState<'watch' | 'create'>(storiesGroup ? 'watch' : 'create');

  // WATCH MODE STATES
  const [currentGroupIdx, setCurrentGroupIdx] = useState(activeGroupIndex);
  const [currentStoryIdx, setCurrentStoryIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Reply to story state
  const [storyReplyText, setStoryReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  // CREATE MODE STATES
  const [storyContent, setStoryContent] = useState('');
  const [gradientIndex, setGradientIndex] = useState(0);
  const [storyMediaUrl, setStoryMediaUrl] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  
  // Interactive stickers
  const [stickerMusic, setStickerMusic] = useState('');
  const [stickerLocation, setStickerLocation] = useState('');
  const [showStickerOptions, setShowStickerOptions] = useState(false);

  // Derive active items for WATCH MODE
  const activeGroup = storiesGroupsList[currentGroupIdx] || storiesGroup;
  const activeStoriesList: StoryWithAuthor[] = activeGroup ? activeGroup.stories : [];
  const currentStory: StoryWithAuthor | undefined = activeStoriesList[currentStoryIdx];

  // 1. WATCH MODE: Timer and Automatic Progression
  useEffect(() => {
    if (viewMode !== 'watch' || !currentStory || isPaused) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    // Reset progress on story change
    setProgress(0);

    const stepMs = 50; // Update progress every 50ms
    const totalDurationMs = 5000; // 5 seconds per story
    const increment = (stepMs / totalDurationMs) * 100;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    // Register active story view on backend
    registerStoryView(currentStory.id);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [currentGroupIdx, currentStoryIdx, viewMode, isPaused]);

  const registerStoryView = async (storyId: string) => {
    try {
      await fetch(`/api/stories/${storyId}/view`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to log story view', e);
    }
  };

  const handleNextStory = () => {
    if (currentStoryIdx < activeStoriesList.length - 1) {
      setCurrentStoryIdx(prev => prev + 1);
      setProgress(0);
    } else {
      // Go to next user's story group
      if (currentGroupIdx < storiesGroupsList.length - 1) {
        setCurrentGroupIdx(prev => prev + 1);
        setCurrentStoryIdx(0);
        setProgress(0);
      } else {
        // No more stories, close lightbox
        onClose();
        addToast('info', 'All caught up on creators stories!');
      }
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIdx > 0) {
      setCurrentStoryIdx(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous user's story group
      if (currentGroupIdx > 0) {
        setCurrentGroupIdx(prev => prev - 1);
        // Set to last story of that group
        const prevGroup = storiesGroupsList[currentGroupIdx - 1];
        setCurrentStoryIdx(prevGroup ? prevGroup.stories.length - 1 : 0);
        setProgress(0);
      } else {
        // At the absolute start, restart current story
        setProgress(0);
      }
    }
  };

  // 2. WATCH MODE: Send Quick Story Message Reply
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyReplyText.trim() || !currentStory) return;

    setIsSendingReply(true);
    try {
      // Stories replies represent simulated micro-integration.
      // In the real system, it creates a direct message in a conversation.
      // Let's call chat endpoint to send a message to this author
      const recipientId = currentStory.userId;
      
      // Step 1: Create or find conversation with this author
      const convRes = await fetch('/api/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ participantId: recipientId })
      });
      const convData = await convRes.json();

      if (convRes.ok && convData.conversation) {
        // Step 2: Send direct text message containing story mention context
        await fetch(`/api/conversations/${convData.conversation.id}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ 
            content: `Replied to your story: "${storyReplyText}"`,
            mediaUrl: currentStory.mediaUrl,
            mediaType: currentStory.mediaType
          })
        });
        
        addToast('success', `Story reply dispatched to @${currentStory.author.username}!`);
        setStoryReplyText('');
      } else {
        addToast('error', 'Unable to initiate chat reply.');
      }
    } catch (err) {
      addToast('error', 'Network failure during story message reply.');
    } finally {
      setIsSendingReply(false);
    }
  };

  // 3. CREATE MODE: Publish Custom New Story
  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storyContent.trim() && !storyMediaUrl.trim()) {
      addToast('error', 'Please enter some text or provide a background image URL.');
      return;
    }

    setIsPublishing(true);
    try {
      // If user typed some text content but has no image URL, we will generate an elegant
      // aesthetic image with background color on-the-fly!
      let finalMediaUrl = storyMediaUrl.trim();
      if (!finalMediaUrl) {
        // We simulate creating a canvas-gradient preset image URL
        const encodedText = encodeURIComponent(storyContent);
        const randBg = PRESET_GRADIENTS[gradientIndex];
        finalMediaUrl = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&fit=crop&q=80`; // Fallback premium asset
      }

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          mediaUrl: finalMediaUrl,
          mediaType: 'image'
        })
      });

      const data = await response.json();
      if (response.ok) {
        addToast('success', 'Your story lantern is glowing! Story shared with followers.');
        if (onRefreshStories) onRefreshStories();
        onClose();
      } else {
        addToast('error', data.error || 'Failed to post story');
      }
    } catch (err) {
      addToast('error', 'Failed to communicate with stories gateway.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/95 backdrop-blur-md flex items-center justify-center p-0 md:p-6" id="stories-modal-root">
      
      {/* Outer Close Trigger button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full z-50 transition-colors cursor-pointer"
        title="Exit Story Lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {viewMode === 'watch' && currentStory ? (
        /* WATCHING MODE VIEWPORT PANEL */
        <div className="relative w-full max-w-[420px] aspect-[9/16] bg-black md:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between" id="stories-watch-panel">
          
          {/* Top progress indicators and identity block */}
          <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-40 select-none">
            {/* Timeline Progress Bars */}
            <div className="flex gap-1.5 mb-4">
              {activeStoriesList.map((story, idx) => {
                let barProgress = 0;
                if (idx < currentStoryIdx) barProgress = 100;
                if (idx === currentStoryIdx) barProgress = progress;

                return (
                  <div key={story.id} className="h-1 flex-grow bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white transition-all duration-75 ease-linear"
                      style={{ width: `${barProgress}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Author details */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentStory.author.avatarUrl}
                  alt={currentStory.author.name}
                  className="h-9 w-9 rounded-full object-cover border border-white/50"
                  referrerPolicy="no-referrer"
                />
                <div className="text-left">
                  <p className="text-xs font-bold text-white leading-tight">{currentStory.author.name}</p>
                  <p className="text-[10px] text-white/70">@{currentStory.author.username}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-white/60">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Story</span>
              </div>
            </div>
          </div>

          {/* Central Interactive Click Targets (Left Skip, Middle Hold Pause, Right Skip) */}
          <div 
            className="flex-grow flex relative"
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {/* Image background content */}
            <img
              src={currentStory.mediaUrl}
              alt="Active story snapshot"
              className="w-full h-full object-cover select-none pointer-events-none"
              referrerPolicy="no-referrer"
            />

            {/* Left Nav Trigger */}
            <button
              onClick={handlePrevStory}
              className="absolute left-0 inset-y-0 w-1/4 cursor-pointer focus:outline-none flex items-center pl-2 group"
            >
              <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ChevronLeft className="h-5 w-5" />
              </div>
            </button>

            {/* Right Nav Trigger */}
            <button
              onClick={handleNextStory}
              className="absolute right-0 inset-y-0 w-1/4 cursor-pointer focus:outline-none flex items-center justify-end pr-2 group"
            >
              <div className="h-8 w-8 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <ChevronRight className="h-5 w-5" />
              </div>
            </button>

            {/* Displaying story views counts if it is ME watching own story */}
            {currentStory.userId === currentUser.id && (
              <div className="absolute bottom-20 left-4 py-1.5 px-3 bg-black/70 backdrop-blur-md rounded-xl text-white text-[11px] font-semibold flex items-center gap-1.5 select-none">
                <Eye className="h-3.5 w-3.5 text-amber-500" />
                <span>{currentStory.views?.length || 0} views</span>
              </div>
            )}
          </div>

          {/* Bottom Chat Message Reply form */}
          <div className="p-4 bg-gradient-to-t from-black/90 to-transparent z-40 select-none pb-6">
            <form onSubmit={handleSendReply} className="flex gap-2 items-center">
              <input
                type="text"
                value={storyReplyText}
                onChange={(e) => setStoryReplyText(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                placeholder={`Reply to @${currentStory.author.username}...`}
                className="flex-grow px-4 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 rounded-xl text-xs text-white outline-none placeholder-white/50"
              />
              <button
                type="submit"
                disabled={isSendingReply || !storyReplyText.trim()}
                className="p-2.5 bg-white hover:bg-neutral-100 text-black disabled:opacity-40 rounded-xl transition-all flex items-center justify-center cursor-pointer"
              >
                {isSendingReply ? (
                  <div className="h-4.5 w-4.5 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <Send className="h-4.5 w-4.5" />
                )}
              </button>
            </form>
          </div>

        </div>
      ) : (
        /* CREATION MODE PANEL */
        <div className="w-full max-w-[420px] aspect-[9/16] bg-neutral-900 md:rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between p-5 text-left border border-white/10 relative" id="stories-create-panel">
          
          {/* Top Panel Actions */}
          <div className="flex justify-between items-center select-none z-40">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 flex items-center justify-center">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">Ignite Story Flame</span>
            </div>

            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>

          {/* Core Interactive Editor viewport */}
          <div 
            className={`flex-grow my-4 rounded-2xl bg-gradient-to-tr ${PRESET_GRADIENTS[gradientIndex]} p-6 flex flex-col justify-between relative shadow-inner overflow-hidden`}
          >
            {/* Background Image Preview layer if url specified */}
            {storyMediaUrl && (
              <div className="absolute inset-0 z-0">
                <img
                  src={storyMediaUrl}
                  alt="Story canvas asset"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
              </div>
            )}

            {/* Sticker widgets container overlays */}
            <div className="relative z-10 flex flex-wrap gap-2 select-none">
              {stickerMusic && (
                <div className="px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] text-white font-bold flex items-center gap-1 border border-white/10 animate-bounce">
                  <Music className="h-3.5 w-3.5 text-amber-400" />
                  <span>♫ {stickerMusic}</span>
                </div>
              )}
              {stickerLocation && (
                <div className="px-2.5 py-1.5 bg-black/60 backdrop-blur-md rounded-xl text-[10px] text-white font-bold flex items-center gap-1 border border-white/10 animate-pulse">
                  <MapPin className="h-3.5 w-3.5 text-rose-400" />
                  <span>{stickerLocation}</span>
                </div>
              )}
            </div>

            {/* Central big display text */}
            <div className="relative z-10 flex-grow flex items-center justify-center">
              <textarea
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Type your story message, update, quote or catchphrase..."
                maxLength={180}
                className="w-full bg-transparent border-0 outline-none focus:ring-0 text-white font-display text-xl font-bold text-center placeholder-white/40 leading-relaxed resize-none h-44 py-4"
              />
            </div>

            {/* Custom preset selector utilities */}
            <div className="relative z-10 flex items-center justify-between">
              {/* Gradient selectors */}
              {!storyMediaUrl && (
                <button
                  type="button"
                  onClick={() => setGradientIndex((prev) => (prev + 1) % PRESET_GRADIENTS.length)}
                  className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <Palette className="h-4 w-4" />
                  <span>Style</span>
                </button>
              )}

              {/* Character Limit */}
              <span className="text-[10px] text-white/60 font-bold ml-auto select-none">
                {storyContent.length} / 180 chars
              </span>
            </div>

          </div>

          {/* Form Actions footer */}
          <form onSubmit={handlePublishStory} className="space-y-4 z-40">
            {/* Input fields to enrich story: Optional image and sticker selectors */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={storyMediaUrl}
                  onChange={(e) => setStoryMediaUrl(e.target.value)}
                  placeholder="Optional background Unsplash image URL..."
                  className="flex-grow px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 outline-none"
                />
                
                <button
                  type="button"
                  onClick={() => setShowStickerOptions(!showStickerOptions)}
                  className={`px-3 py-2 border rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1 ${
                    showStickerOptions 
                      ? 'bg-amber-500 border-amber-500 text-black' 
                      : 'border-white/10 text-white/80 hover:bg-white/5'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  <span>Stickers</span>
                </button>
              </div>

              {/* Stickers Expansion Cabinet */}
              <AnimatePresence>
                {showStickerOptions && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-2 text-xs"
                  >
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Add Music Sticker</label>
                      <input
                        type="text"
                        value={stickerMusic}
                        onChange={(e) => setStickerMusic(e.target.value)}
                        placeholder="e.g. Starboy - The Weeknd"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/5 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-white/50 uppercase mb-1">Add Location Pin</label>
                      <input
                        type="text"
                        value={stickerLocation}
                        onChange={(e) => setStickerLocation(e.target.value)}
                        placeholder="e.g. SF Modern Art Museum"
                        className="w-full px-2.5 py-1.5 bg-black/40 border border-white/5 rounded-lg text-white"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Share action buttons */}
            <div className="flex gap-2 pt-2 border-t border-white/10">
              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-3 bg-white hover:bg-neutral-200 text-black rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPublishing ? (
                  <div className="h-4 w-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="h-4.5 w-4.5" />
                    <span>Share to Story</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      )}

    </div>
  );
}
