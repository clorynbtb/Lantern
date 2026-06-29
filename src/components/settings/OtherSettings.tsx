/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  HardDrive, 
  Sparkles, 
  FlaskConical, 
  Info, 
  Volume2, 
  Eye, 
  Bookmark, 
  Sliders, 
  ShieldAlert, 
  Compass, 
  Cpu, 
  Bug, 
  MessageSquareShare
} from 'lucide-react';
import { SettingsState } from './types.ts';

interface OtherSettingsProps {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function OtherSettings({
  settings,
  updateSetting,
  addToast
}: OtherSettingsProps) {
  const [cache, setCache] = useState(settings.cacheSize);

  const clearCacheNode = () => {
    addToast('info', 'Deallocating storyboards and image frame caches...');
    setTimeout(() => {
      setCache(0);
      updateSetting('cacheSize', 0);
      addToast('success', 'Media layout cache emptied! 0.0 MB utilized.');
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left" id="settings-other-panel">
      {/* 🔔 Notifications Hub Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Bell className="h-5 w-5 text-theme-primary" />
          <span>Interactive Notifications & Alerts</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Govern active triggers for likes, replies, stories, system product reports, delivery modes, and quiet hours.
        </p>

        {/* Notifications list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-1">
          {[
            { id: 'likes', label: 'Reaction Likes Alerts', desc: 'Heart and star feedback on your posted thoughts.' },
            { id: 'comments', label: 'Comment Replies', desc: 'Alerts when people leave notes on your cards.' },
            { id: 'replies', label: 'Direct Thread Replies', desc: 'Push notes on visual nested replies.' },
            { id: 'mentions', label: 'Handle @Mentions', desc: 'When storytellers reference your public handle.' },
            { id: 'followers', label: 'New Follower Additions', desc: 'Triggers when new nodes connect to you.' },
            { id: 'followRequests', label: 'Follow Request Prompts', desc: 'Approval prompts for restricted accounts.' },
            { id: 'messages', label: 'Direct Messages (DMs)', desc: 'Notifications on private text conversations.' },
            { id: 'storyViews', label: 'Active Story Views', desc: 'Logs of who view your dynamic status cards.' },
            { id: 'storyReplies', label: 'Replies to Stories', desc: 'Reactions sent directly to your status.' },
            { id: 'savedPostReminders', label: 'Saved Bookmark Reminders', desc: 'Occasional checks of archived posts.' },
            { id: 'securityAlerts', label: 'Security & Device Alarms', desc: 'Immediate logins from unrecognized devices.' },
            { id: 'productAnnouncements', label: 'Product News & Changelogs', desc: 'Lantern development logs.' }
          ].map((n) => (
            <label key={n.id} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings as any)[n.id]}
                onChange={(e) => updateSetting(n.id as any, e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4.5 h-4.5 mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-theme-text block">{n.label}</span>
                <span className="text-[10px] text-theme-muted block">{n.desc}</span>
              </div>
            </label>
          ))}
        </div>

        {/* Deliver Channels */}
        <div className="border-t border-theme-border pt-4">
          <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block mb-2.5">Alert Delivery Channels</span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'deliveryInApp', label: 'In-App Banner' },
              { id: 'deliveryEmail', label: 'Email Digests' },
              { id: 'deliveryPush', label: 'Mobile Push' },
              { id: 'deliveryDesktop', label: 'Desktop Alert' }
            ].map((ch) => (
              <label key={ch.id} className="p-2.5 bg-theme-secondary/20 border border-theme-border rounded-xl flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(settings as any)[ch.id]}
                  onChange={(e) => updateSetting(ch.id as any, e.target.checked)}
                  className="rounded text-theme-primary w-4 h-4"
                />
                <span className="text-[10px] text-theme-text font-bold">{ch.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sounds / Vibration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-theme-border pt-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-theme-muted uppercase block">Alert Sound & Haptics</span>
            <div className="space-y-1.5">
              <label className="flex items-center justify-between p-2.5 bg-theme-secondary/15 rounded-xl border border-theme-border/60 cursor-pointer">
                <span className="text-xs font-semibold text-theme-text">Play Notification Sounds</span>
                <input
                  type="checkbox"
                  checked={settings.notificationSound}
                  onChange={(e) => updateSetting('notificationSound', e.target.checked)}
                  className="rounded text-theme-primary w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between p-2.5 bg-theme-secondary/15 rounded-xl border border-theme-border/60 cursor-pointer">
                <span className="text-xs font-semibold text-theme-text">Vibrate Device (Haptics)</span>
                <input
                  type="checkbox"
                  checked={settings.vibration}
                  onChange={(e) => updateSetting('vibration', e.target.checked)}
                  className="rounded text-theme-primary w-4 h-4"
                />
              </label>
            </div>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-theme-muted uppercase block">Quiet Night Hours</span>
              <input
                type="checkbox"
                checked={settings.quietHours}
                onChange={(e) => updateSetting('quietHours', e.target.checked)}
                className="rounded text-theme-primary w-4 h-4"
              />
            </div>
            <p className="text-[9px] text-theme-muted leading-normal">
              Block incoming sounds and banner overlays during your comfortable night intervals.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="time"
                value={settings.quietHoursStart}
                onChange={(e) => updateSetting('quietHoursStart', e.target.value)}
                disabled={!settings.quietHours}
                className="text-xs px-2.5 py-2 bg-theme-secondary/30 rounded-xl border border-theme-border text-theme-text disabled:opacity-40 outline-none"
              />
              <input
                type="time"
                value={settings.quietHoursEnd}
                onChange={(e) => updateSetting('quietHoursEnd', e.target.value)}
                disabled={!settings.quietHours}
                className="text-xs px-2.5 py-2 bg-theme-secondary/30 rounded-xl border border-theme-border text-theme-text disabled:opacity-40 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ❤️ Feed Preferences Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Compass className="h-5 w-5 text-theme-primary" />
          <span>Storyteller Feed Preferences</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Customize content algorithms to highlight interesting topics, filter seen cards, and mute specific tags.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Default Landing Feed</label>
            <select
              value={settings.defaultFeed}
              onChange={(e) => updateSetting('defaultFeed', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="home">Home Feed (Curated Algorithm)</option>
              <option value="following">Following Only (Pure Chronology)</option>
              <option value="latest">Latest Stories (Global posts)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Aesthetic Topics Interest Fields</label>
            <input
              type="text"
              value={settings.preferredTopics}
              onChange={(e) => updateSetting('preferredTopics', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none focus:border-theme-primary"
              placeholder="minimalism, design systems"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-theme-border pt-4">
          {[
            { id: 'hideSeenPosts', label: 'Hide Viewed Stories' },
            { id: 'hideSponsoredContent', label: 'Filter Sponsored Nodes' },
            { id: 'hideReposts', label: 'Hide Shared Reposts' },
            { id: 'hideStories', label: 'Mute Status Reels' },
            { id: 'hideSuggestedUsers', label: 'Hide Suggested Prompts' },
            { id: 'showSensitiveContent', label: 'Always Show Sensitive' }
          ].map((feed) => (
            <label key={feed.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-theme-secondary/15 border border-theme-border/60">
              <input
                type="checkbox"
                checked={(settings as any)[feed.id]}
                onChange={(e) => updateSetting(feed.id as any, e.target.checked)}
                className="rounded text-theme-primary w-4 h-4"
              />
              <span className="text-[10px] text-theme-text font-bold leading-none">{feed.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* 📦 Media & System Performance Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-theme-primary" />
          <span>Media Caching & System Performance</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Govern auto-play limits, media qualities, data saver caps, and flush local disk storage allocations.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Video Auto-Play</label>
            <label className="flex items-center gap-2.5 p-2 bg-theme-secondary/20 rounded-xl border border-theme-border mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoplayVideos}
                onChange={(e) => updateSetting('autoplayVideos', e.target.checked)}
                className="rounded text-theme-primary w-4 h-4"
              />
              <span className="text-xs text-theme-text font-bold">Auto-play videos</span>
            </label>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Video Quality Render</label>
            <select
              value={settings.videoQuality}
              onChange={(e) => updateSetting('videoQuality', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="low">Data Saver (480p)</option>
              <option value="auto">Adaptive Quality</option>
              <option value="high">High Definition (1080p)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Image Qualities</label>
            <select
              value={settings.imageQuality}
              onChange={(e) => updateSetting('imageQuality', e.target.value)}
              className="w-full text-xs mt-1 px-2.5 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text"
            >
              <option value="low">Compressed WebP</option>
              <option value="auto">Adaptive PNG</option>
              <option value="high">Retina Ultra-PNG</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-theme-border pt-4">
          {[
            { id: 'dataSaver', label: 'Data Saver Protocol' },
            { id: 'lazyLoadingPreference', label: 'Lazy Load Viewports' },
            { id: 'preloadImages', label: 'Preload Hover Cards' },
            { id: 'reduceBackgroundRequests', label: 'Block Idle Polling' }
          ].map((pf) => (
            <label key={pf.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-theme-secondary/15 border border-theme-border/60">
              <input
                type="checkbox"
                checked={(settings as any)[pf.id]}
                onChange={(e) => updateSetting(pf.id as any, e.target.checked)}
                className="rounded text-theme-primary w-4 h-4"
              />
              <span className="text-[10px] text-theme-text font-bold leading-none">{pf.label}</span>
            </label>
          ))}
        </div>

        <div className="flex items-center justify-between text-xs p-3.5 bg-theme-secondary/20 rounded-2xl border border-theme-border/60 border-dashed">
          <div className="space-y-0.5">
            <span className="block font-bold text-theme-text">Cached Layout Assets size</span>
            <span className="text-[10px] text-theme-muted font-mono block">{cache.toFixed(1)} Megabytes (MB) of temporary storage used</span>
          </div>
          <button
            onClick={clearCacheNode}
            disabled={cache === 0}
            className="px-3.5 py-2 bg-theme-primary hover:bg-theme-primary-hover disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* 🧠 AI Copilot Features Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-theme-primary" />
          <span>Ambient AI Features & Writing Copilot (Optional)</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Enable or disable individually integrated Gemini AI micro-agents for text drafting, summarizations, and automatic commentaries.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            { id: 'aiCaptionSuggestions', label: 'AI Post Caption Suggestions', desc: 'Auto-suggest aesthetic headings for microblog stories.' },
            { id: 'aiWritingAssistant', label: 'AI Interactive Writing assistant', desc: 'Expand short thoughts into long-form poetry layouts.' },
            { id: 'aiContentSummary', label: 'AI Story Summarization Nodes', desc: 'Display condensed visual summaries above lengthy stories.' },
            { id: 'aiSearch', label: 'Aesthetic Semantic AI Search', desc: 'Use semantic matches rather than rigid keyword lists.' },
            { id: 'aiTranslation', label: 'AI Story Translation Engine', desc: 'Instantly translate text into regional display settings.' },
            { id: 'aiCommentSuggestions', label: 'AI Instant Reply Suggestions', desc: 'Show smart contextual replies above nested threads.' }
          ].map((ai) => (
            <label key={ai.id} className="p-3 bg-theme-secondary/15 rounded-xl border border-theme-border/60 hover:bg-theme-secondary/30 transition-all flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings as any)[ai.id]}
                onChange={(e) => updateSetting(ai.id as any, e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4.5 h-4.5 mt-0.5"
              />
              <div>
                <span className="block text-xs font-bold text-theme-text">{ai.label}</span>
                <span className="text-[9px] text-theme-muted mt-0.5 block leading-relaxed">{ai.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 🔬 Experimental labs */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-theme-primary" />
          <span>Experimental Labs & Diagnostic overlays</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Opt-in to beta developer toggles, rendering speedometers, and diagnostic panels.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {[
            { id: 'betaFeatures', label: 'Access Early Beta Content Nodes', desc: 'Test unstable multiplayer collaborative story spaces.' },
            { id: 'labs', label: 'Ambient Synth Noise Generators', desc: 'Play ambient white-noise loops directly in search reels.' },
            { id: 'previewUpcomingUi', label: 'Preview Immersive Layout Styles', desc: 'Apply early concepts of the upcoming v3 grid UI.' },
            { id: 'enableDebugOverlay', label: 'Aesthetic Diagnostic Overlays', desc: 'Render HTML structures and API latency trackers.' },
            { id: 'enablePerformanceMetrics', label: 'Performance Latency charts', desc: 'Display memory and render speed graphs.' },
            { id: 'developerMode', label: 'Global Developer Environment Toggle', desc: 'Unlock administrative tools and command line sheets.' }
          ].map((exp) => (
            <label key={exp.id} className="p-3 bg-theme-secondary/15 rounded-xl border border-theme-border/60 hover:bg-theme-secondary/30 transition-all flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings as any)[exp.id]}
                onChange={(e) => updateSetting(exp.id as any, e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4.5 h-4.5 mt-0.5"
              />
              <div>
                <span className="block text-xs font-bold text-theme-text">{exp.label}</span>
                <span className="text-[9px] text-theme-muted mt-0.5 block leading-relaxed">{exp.desc}</span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* 📖 About Lantern Card */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-theme-primary/10 text-theme-primary border border-theme-border">
          <Cpu className="h-7 w-7 text-theme-primary animate-pulse" />
        </div>
        <div className="space-y-1">
          <h4 className="font-display font-bold text-lg text-theme-text">Lantern Social Ledger</h4>
          <span className="text-[10px] font-mono bg-theme-secondary text-theme-primary border border-theme-border px-3 py-1 rounded-full font-bold">
            v2.5.0-stable build
          </span>
        </div>
        <p className="text-xs text-theme-muted leading-relaxed max-w-md mx-auto">
          Lantern is built on an offline-first decentralised structure representing software tranquility. We never lease personal records or click lists to commercial trackers.
        </p>

        {/* Links / Bug reports / Requests */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-theme-border pt-4 text-xs font-semibold text-theme-primary">
          <button onClick={() => addToast('info', 'Version 2.5 Deployed! Released on 2026-06-28.')} className="p-2 hover:bg-theme-secondary/35 rounded-xl transition-colors cursor-pointer">Release Notes</button>
          <button onClick={() => addToast('info', 'All libraries compliant with Apache-2.0 and MIT standard protocols.')} className="p-2 hover:bg-theme-secondary/35 rounded-xl transition-colors cursor-pointer">Licenses & Open Src</button>
          <button onClick={() => addToast('success', 'Terms of Service is local and encrypted.')} className="p-2 hover:bg-theme-secondary/35 rounded-xl transition-colors cursor-pointer">Terms & Privacy</button>
          <button onClick={() => addToast('info', 'Support ticket channels active at support@lantern.net.')} className="p-2 hover:bg-theme-secondary/35 rounded-xl transition-colors cursor-pointer">Contact Support</button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs font-semibold pt-1 text-theme-primary">
          <button 
            onClick={() => addToast('success', 'Bug telemetry collected! Ticket logged successfully.')} 
            className="p-2.5 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 text-rose-600 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Bug className="h-4 w-4" /> Report a System Bug
          </button>
          <button 
            onClick={() => addToast('success', 'Feature proposal captured! Appending to roadmap ledger.')} 
            className="p-2.5 bg-theme-primary/10 hover:bg-theme-primary/15 border border-theme-primary/20 text-theme-primary rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MessageSquareShare className="h-4 w-4" /> Request a Feature
          </button>
        </div>
      </div>
    </div>
  );
}
