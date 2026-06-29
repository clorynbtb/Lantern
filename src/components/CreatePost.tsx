/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, DragEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Image, X, CloudUpload as UploadCloud, Sparkles, Smile } from 'lucide-react';
import { PostWithAuthor } from '../types.ts';

interface CreatePostProps {
  token: string;
  currentUser: { id: string; email: string; username: string; name: string; avatarUrl?: string };
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onPostCreated: (post: PostWithAuthor) => void;
}

const AESTHETIC_PRESETS = [
  { name: 'Warm Cozy', url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&fit=crop' },
  { name: 'Lantern Glow', url: 'https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&fit=crop' },
  { name: 'Coffee Nook', url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&fit=crop' },
  { name: 'Sunset Sky', url: 'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=800&fit=crop' },
  { name: 'Calm Study', url: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800&fit=crop' },
];

export default function CreatePost({ token, currentUser, addToast, onPostCreated }: CreatePostProps) {
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Saved draft if any on mount
  useEffect(() => {
    const saved = localStorage.getItem('lantern_post_draft');
    if (saved && saved.trim()) {
      setContent(saved);
      setIsDraftRestored(true);
      addToast('info', 'Recovered your unpublished draft.');
    }
  }, []);

  // Handler for text area changes
  const handleTextChange = (val: string) => {
    setContent(val);
    localStorage.setItem('lantern_post_draft', val);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Please upload an image file (PNG, JPG, etc.).');
      return;
    }

    // Read the file as a DataURL (base64) so it displays locally and persists in DB mock
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setMediaUrl(reader.result);
        addToast('success', 'Image attached successfully!');
      }
    };
    reader.onerror = () => {
      addToast('error', 'Failed to read the file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePresetSelect = (url: string, name: string) => {
    setMediaUrl(url);
    addToast('success', `Applied "${name}" design preset.`);
    setShowPresets(false);
  };

  const handleRemoveMedia = () => {
    setMediaUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !mediaUrl.trim()) {
      addToast('error', 'Post cannot be empty.');
      return;
    }

    setIsCreating(true);
    try {
      const mediaUrls = mediaUrl.trim() ? [mediaUrl.trim()] : [];
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, mediaUrls }),
      });

      const data = await response.json();
      if (response.ok) {
        onPostCreated(data.post);
        setContent('');
        setMediaUrl('');
        localStorage.removeItem('lantern_post_draft');
        setIsDraftRestored(false);
        addToast('success', 'Your story has been lit!');
      } else {
        addToast('error', data.error || 'Failed to publish post.');
      }
    } catch (err) {
      addToast('error', 'Network failure while publishing.');
    } finally {
      setIsCreating(false);
    }
  };

  const userAvatar = currentUser.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop';

  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const estReadTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div
      className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm transition-all"
      id="standalone-create-post-container"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User profile & textarea input */}
        <div className="flex gap-4">
          <img
            src={userAvatar}
            alt="Current User Avatar"
            className="h-11 w-11 rounded-full object-cover border border-theme-border"
            referrerPolicy="no-referrer"
          />
          <div className="flex-grow space-y-2">
            <textarea
              value={content}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder="What's glowing on your mind? Share a thoughtful story..."
              className="w-full text-base bg-transparent border-0 outline-none resize-none text-theme-text placeholder-theme-muted min-h-[95px] font-sans focus:ring-0 leading-relaxed"
              id="create-post-textarea"
            />
            
            {/* Dynamic visual indicator for length and reading time */}
            {charCount > 0 && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-theme-muted font-mono select-none">
                <span className="bg-theme-secondary/25 px-2 py-0.5 rounded-md">
                  {charCount} chars
                </span>
                <span className="bg-theme-secondary/25 px-2 py-0.5 rounded-md">
                  {wordCount} words
                </span>
                <span className="text-theme-primary font-semibold">
                  ~{estReadTime} min read
                </span>
                {isDraftRestored && (
                  <span className="text-amber-600 dark:text-amber-400 font-bold ml-auto animate-pulse flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Draft Restored
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Media Attachment Preview */}
        <AnimatePresence>
          {mediaUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative rounded-2xl overflow-hidden group border border-theme-border shadow-inner bg-theme-secondary/20"
              id="create-post-media-preview-container"
            >
              <img
                src={mediaUrl}
                alt="Post attachment preview"
                className="w-full max-h-[300px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemoveMedia}
                  className="p-3 bg-red-600 hover:bg-red-750 text-white rounded-full transition-transform hover:scale-110 shadow-lg cursor-pointer"
                  title="Remove image attachment"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Drag and Drop File Upload Area */}
        {!mediaUrl && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={triggerFileSelect}
            className={`py-6 px-4 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
              isDragging
                ? 'border-theme-primary bg-theme-primary/5'
                : 'border-theme-border hover:border-theme-primary hover:bg-theme-secondary/40'
            }`}
            id="drag-drop-upload-zone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <UploadCloud className={`h-8 w-8 transition-colors ${isDragging ? 'text-theme-primary' : 'text-theme-muted'}`} />
            <div className="text-center">
              <p className="text-xs font-semibold text-theme-text">
                Drag and drop image here, or <span className="text-theme-primary hover:underline">browse</span>
              </p>
              <p className="text-[10px] text-theme-muted mt-0.5">Supports PNG, JPG, GIF up to 5MB</p>
            </div>
          </div>
        )}

        {/* Presets and Actions Bar */}
        <div className="border-t border-theme-border pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPresets(!showPresets)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                showPresets
                  ? 'border-theme-primary bg-theme-primary/10 text-theme-primary'
                  : 'border-theme-border hover:bg-theme-secondary text-theme-text'
              }`}
              id="presets-trigger-btn"
            >
              <Sparkles className="h-4 w-4" />
              <span>Aesthetic Presets</span>
            </button>

            <button
              type="button"
              onClick={() => {
                const manualUrl = window.prompt('Enter an external Unsplash or web image URL:');
                if (manualUrl && manualUrl.trim()) {
                  setMediaUrl(manualUrl.trim());
                  addToast('success', 'Custom image URL linked!');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-theme-border hover:bg-theme-secondary text-theme-text transition-colors cursor-pointer"
            >
              <Image className="h-4 w-4" />
              <span>Paste Image URL</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isCreating || (!content.trim() && !mediaUrl.trim())}
              className="py-2.5 px-6 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              id="publish-post-btn"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-t border-white" />
                  <span>Glowing...</span>
                </>
              ) : (
                <span>Light Up Feed</span>
              )}
            </button>
          </div>
        </div>

        {/* Presets Tray */}
        <AnimatePresence>
          {showPresets && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
              id="presets-tray"
            >
              <div className="p-3 bg-theme-secondary/20 rounded-2xl border border-theme-border mt-2">
                <p className="text-[10px] font-bold text-theme-muted uppercase tracking-wider mb-2">Select a warm visual cover:</p>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {AESTHETIC_PRESETS.map((preset) => (
                    <div
                      key={preset.name}
                      onClick={() => handlePresetSelect(preset.url, preset.name)}
                      className="group relative h-16 rounded-xl overflow-hidden cursor-pointer border border-theme-border shadow-sm"
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-end p-1.5">
                        <span className="text-[9px] font-bold text-white tracking-tight">{preset.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
