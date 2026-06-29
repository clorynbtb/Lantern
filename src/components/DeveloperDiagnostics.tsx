/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Cpu,
  Activity,
  Trash2,
  Users,
  Bell,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Flame,
  Wrench,
  ToggleLeft,
  ToggleRight,
  Code,
  Globe
} from 'lucide-react';

interface DeveloperDiagnosticsProps {
  token: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
  onRefreshData?: () => void;
}

interface NetworkLog {
  id: string;
  method: string;
  path: string;
  timestamp: string;
  latencyMs: number;
  status: number;
}

export default function DeveloperDiagnostics({
  token,
  addToast,
  onRefreshData
}: DeveloperDiagnosticsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'sandbox' | 'logs' | 'flags'>('sandbox');
  
  // Simulated Diagnostic values
  const [fps, setFps] = useState(60);
  const [latency, setLatency] = useState(24); // ms
  const [cpuLoad, setCpuLoad] = useState(12); // %
  const [sandboxLogs, setSandboxLogs] = useState<NetworkLog[]>([]);

  // Feature Flags
  const [flags, setFlags] = useState<{ [key: string]: boolean }>({
    musicStories: false,
    semanticSearch: false,
    voiceMessages: false,
    centralizedRoleAuthority: false
  });

  // Track rendering frame ticks
  const lastFrameTime = useRef<number>(performance.now());
  const frameCount = useRef<number>(0);

  useEffect(() => {
    // 1. Restore flags from localStorage
    const savedFlags = localStorage.getItem('lantern_feature_flags');
    if (savedFlags) {
      try {
        setFlags(JSON.parse(savedFlags));
      } catch (e) {}
    }

    // 2. Continuous Telemetry Simulation
    const telemetryInterval = setInterval(() => {
      // Simulate slight frame drops and cpu spikes
      setFps(Math.floor(58 + Math.random() * 3));
      setCpuLoad(Math.floor(8 + Math.random() * 14));
      setLatency(Math.floor(18 + Math.random() * 22));
    }, 1500);

    // 3. Intercept Network fetch requests (by storing logs of actions)
    // We create a listener for custom developer event triggers
    const logNetworkCall = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setSandboxLogs(prev => [
          {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
            method: customEvent.detail.method || 'GET',
            path: customEvent.detail.path || '/api',
            timestamp: new Date().toLocaleTimeString(),
            latencyMs: customEvent.detail.latencyMs || Math.floor(20 + Math.random() * 40),
            status: customEvent.detail.status || 200
          },
          ...prev.slice(0, 19) // Limit to last 20 logs
        ]);
      }
    };

    window.addEventListener('dev_network_log', logNetworkCall);

    return () => {
      clearInterval(telemetryInterval);
      window.removeEventListener('dev_network_log', logNetworkCall);
    };
  }, []);

  const triggerLogEvent = (method: string, path: string, status: number, latencyMs: number) => {
    window.dispatchEvent(new CustomEvent('dev_network_log', {
      detail: { method, path, status, latencyMs }
    }));
  };

  // --- ACTIONS ---
  const handleGenerateNotification = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/dev/generate-notification', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const duration = Math.floor(performance.now() - start);
      triggerLogEvent('POST', '/api/admin/dev/generate-notification', res.status, duration);

      if (res.ok) {
        addToast('success', 'Sandbox Alert: Simulating real-time connection trigger!');
        // Fire custom reload event so notification feeds automatically update
        window.dispatchEvent(new CustomEvent('new_notification_received'));
        if (onRefreshData) onRefreshData();
      } else {
        addToast('error', data.error || 'Failed to generate mock notification');
      }
    } catch (e) {
      addToast('error', 'Network failure during notification generation');
    }
  };

  const handleGenerateUser = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/dev/generate-user', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const duration = Math.floor(performance.now() - start);
      triggerLogEvent('POST', '/api/admin/dev/generate-user', res.status, duration);

      if (res.ok) {
        addToast('success', `Sandbox Creator Injected: @${data.user.username}`);
        if (onRefreshData) onRefreshData();
      } else {
        addToast('error', data.error || 'Failed to inject mock user');
      }
    } catch (e) {
      addToast('error', 'Network failure during user generation');
    }
  };

  const handleGenerateStory = async () => {
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/dev/generate-story', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const duration = Math.floor(performance.now() - start);
      triggerLogEvent('POST', '/api/admin/dev/generate-story', res.status, duration);

      if (res.ok) {
        addToast('success', 'Sandbox Story Injected! Watch the stories slide update.');
        if (onRefreshData) onRefreshData();
      } else {
        addToast('error', data.error || 'Failed to inject story');
      }
    } catch (e) {
      addToast('error', 'Network failure during story injection');
    }
  };

  const handleSeedWorld = async () => {
    const start = performance.now();
    addToast('info', 'Seeding the living world... This may take a minute.');
    try {
      const res = await fetch('/api/admin/dev/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ count: 150 }),
      });
      const data = await res.json();
      const duration = Math.floor(performance.now() - start);
      triggerLogEvent('POST', '/api/admin/dev/seed', res.status, duration);

      if (res.ok) {
        addToast('success', `Living world seeded! ${data.stats.users} users, ${data.stats.posts} posts, ${data.stats.communities} communities.`);
        window.dispatchEvent(new CustomEvent('sandbox_data_refreshed'));
        if (onRefreshData) onRefreshData();
      } else {
        addToast('error', data.error || 'Failed to seed world');
      }
    } catch (e) {
      addToast('error', 'Network failure during world seeding');
    }
  };

  const handlePurgeDatabase = async () => {
    if (!window.confirm('WARNING: This will wipe all user-created sandbox posts, comments, likes, and stories! Proceed?')) return;
    
    const start = performance.now();
    try {
      const res = await fetch('/api/admin/dev/clear-database', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const duration = Math.floor(performance.now() - start);
      triggerLogEvent('POST', '/api/admin/dev/clear-database', res.status, duration);

      if (res.ok) {
        addToast('success', 'Sandbox Database fully purged and refreshed!');
        if (onRefreshData) onRefreshData();
      } else {
        addToast('error', data.error || 'Purge failed.');
      }
    } catch (e) {
      addToast('error', 'Network error during sandbox purge');
    }
  };

  const toggleFlag = (flagName: string) => {
    const updated = { ...flags, [flagName]: !flags[flagName] };
    setFlags(updated);
    localStorage.setItem('lantern_feature_flags', JSON.stringify(updated));
    addToast('info', `Flag Updated: ${flagName} set to ${updated[flagName] ? 'ENABLED' : 'DISABLED'}`);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="dev-diagnostics-root">
      
      {/* Floating Pill Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border border-neutral-800 dark:border-neutral-200 shadow-2xl rounded-full text-xs font-bold flex items-center gap-2 cursor-pointer"
        id="dev-diagnostics-toggle"
      >
        <Wrench className={`h-4 w-4 ${isOpen ? 'rotate-45' : ''} transition-transform duration-300`} />
        <span>Sandbox DevTools</span>
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </motion.button>

      {/* Diagnostics Overlay HUD Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="w-[340px] md:w-[380px] bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden text-left font-mono text-xs text-neutral-400 mt-2 flex flex-col h-[480px]"
            id="dev-diagnostics-panel"
          >
            {/* Header Telemetry stats */}
            <div className="p-4 bg-neutral-900 border-b border-neutral-800 grid grid-cols-3 text-center divide-x divide-neutral-800 select-none">
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500">Render HUD</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-green-400 font-bold">
                  <Activity className="h-3.5 w-3.5 animate-pulse" />
                  <span>{fps} FPS</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500">Net Latency</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-amber-400 font-bold">
                  <Flame className="h-3.5 w-3.5" />
                  <span>{latency} ms</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-neutral-500">CPU Load</p>
                <div className="flex items-center justify-center gap-1 mt-1 text-indigo-400 font-bold">
                  <Cpu className="h-3.5 w-3.5" />
                  <span>{cpuLoad}%</span>
                </div>
              </div>
            </div>

            {/* Central Navigation Tabs */}
            <div className="flex border-b border-neutral-800 text-center text-[10px] font-bold uppercase tracking-wider select-none bg-neutral-950/50">
              <button
                onClick={() => setActiveTab('sandbox')}
                className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'sandbox' ? 'border-amber-500 text-white bg-neutral-900/30' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Mock Generator
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'logs' ? 'border-amber-500 text-white bg-neutral-900/30' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                API Inspector ({sandboxLogs.length})
              </button>
              <button
                onClick={() => setActiveTab('flags')}
                className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'flags' ? 'border-amber-500 text-white bg-neutral-900/30' : 'border-transparent text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Feature Flags
              </button>
            </div>

            {/* Tab Contents Panels */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              
              {activeTab === 'sandbox' && (
                <div className="space-y-3" id="dev-sandbox-tab">
                  <div className="bg-neutral-900/40 p-3 rounded-xl border border-neutral-800 space-y-1.5 text-[11px] leading-relaxed">
                    <p className="font-bold text-white uppercase text-[9px] tracking-wide flex items-center gap-1">
                      <Code className="h-3.5 w-3.5 text-amber-500" />
                      <span>Sandbox Environment</span>
                    </p>
                    <p className="text-neutral-500">Inject mock datasets and simulate dynamic connections directly into the JSON filesystem.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={handleGenerateNotification}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left hover:text-white transition-colors cursor-pointer flex flex-col justify-between h-20"
                    >
                      <Bell className="h-4.5 w-4.5 text-amber-500" />
                      <div>
                        <p className="font-bold text-white text-[10px]">Gen Alert</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5 truncate">Likes/Comments/Follows</p>
                      </div>
                    </button>

                    <button
                      onClick={handleGenerateUser}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left hover:text-white transition-colors cursor-pointer flex flex-col justify-between h-20"
                    >
                      <Users className="h-4.5 w-4.5 text-indigo-500" />
                      <div>
                        <p className="font-bold text-white text-[10px]">Gen Creator</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5 truncate">Inject user + profile</p>
                      </div>
                    </button>

                    <button
                      onClick={handleGenerateStory}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-left hover:text-white transition-colors cursor-pointer flex flex-col justify-between h-20"
                    >
                      <Sparkles className="h-4.5 w-4.5 text-green-500" />
                      <div>
                        <p className="font-bold text-white text-[10px]">Gen Story</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5 truncate">Dynamic story card</p>
                      </div>
                    </button>

                    <button
                      onClick={handleSeedWorld}
                      className="p-3 bg-neutral-900 hover:bg-neutral-800 border border-amber-500/30 rounded-xl text-left hover:text-white transition-colors cursor-pointer flex flex-col justify-between h-20"
                    >
                      <Globe className="h-4.5 w-4.5 text-amber-500" />
                      <div>
                        <p className="font-bold text-white text-[10px]">Seed World</p>
                        <p className="text-[9px] text-neutral-500 mt-0.5 truncate">150 users, posts, communities</p>
                      </div>
                    </button>

                    <button
                      onClick={handlePurgeDatabase}
                      className="p-3 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 rounded-xl text-left text-red-400 hover:text-red-200 transition-colors cursor-pointer flex flex-col justify-between h-20"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                      <div>
                        <p className="font-bold text-[10px]">Wipe Sandbox</p>
                        <p className="text-[9px] text-red-500/80 mt-0.5 truncate">Purge user inputs</p>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'logs' && (
                <div className="space-y-2.5" id="dev-logs-tab">
                  <p className="font-bold text-white text-[10px] uppercase tracking-wide">Client Fetch Interceptor</p>
                  
                  {sandboxLogs.length > 0 ? (
                    <div className="space-y-1.5 max-h-[290px] overflow-y-auto">
                      {sandboxLogs.map((log) => (
                        <div key={log.id} className="p-2 bg-neutral-900/50 rounded-lg border border-neutral-800 flex justify-between items-center text-[10px]">
                          <div className="space-y-0.5 text-left truncate max-w-[210px]">
                            <p className="font-bold text-white flex items-center gap-1.5">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                log.method === 'POST' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                              }`}>{log.method}</span>
                              <span className="truncate">{log.path}</span>
                            </p>
                            <p className="text-[9px] text-neutral-500">{log.timestamp} • {log.latencyMs}ms response latency</p>
                          </div>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[9px] ${
                            log.status >= 400 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>{log.status}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 text-neutral-500">
                      <Layers className="h-5 w-5 mx-auto mb-1.5" />
                      <span>No intercept logs. Action buttons to populate history stack.</span>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'flags' && (
                <div className="space-y-3" id="dev-flags-tab">
                  <div className="bg-neutral-900/40 p-3 rounded-xl border border-neutral-800 text-[11px] leading-relaxed mb-2">
                    <p className="font-bold text-white uppercase text-[9px] tracking-wide mb-1">Experimental Feature Toggles</p>
                    <p className="text-neutral-500">Instantly switch feature gates. This simulates central control rollouts.</p>
                  </div>

                  <div className="space-y-2.5">
                    {Object.keys(flags).map((flag) => (
                      <div key={flag} className="flex justify-between items-center bg-neutral-900/30 p-2.5 rounded-xl border border-neutral-800">
                        <div className="text-left">
                          <p className="font-bold text-white text-[11px]">
                            {flag === 'musicStories' && '♫ Music & Stickers Stories'}
                            {flag === 'semanticSearch' && '🔍 Semantic AI Search Node'}
                            {flag === 'voiceMessages' && '🎙️ Direct Voice Messages'}
                            {flag === 'centralizedRoleAuthority' && '🛡️ Centralized Role Authority'}
                          </p>
                          <p className="text-[9px] text-neutral-500 mt-0.5">
                            {flag === 'musicStories' && 'Enables stickers and music selection grids.'}
                            {flag === 'semanticSearch' && 'Switches core query vectors on database.'}
                            {flag === 'voiceMessages' && 'Simulate sending voice memos in chat.'}
                            {flag === 'centralizedRoleAuthority' && 'Centralizes Moderator/Admin roles checks.'}
                          </p>
                        </div>

                        <button
                          onClick={() => toggleFlag(flag)}
                          className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          {flags[flag] ? (
                            <ToggleRight className="h-6 w-6 text-green-400" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-neutral-600" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
