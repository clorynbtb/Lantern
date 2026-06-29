/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertTriangle, Check, Trash2, Users, FileText, Flame, BarChart3 } from 'lucide-react';
import { ReportWithDetails } from '../types.ts';

interface AdminSectionProps {
  token: string;
  addToast: (type: 'success' | 'error', text: string) => void;
}

export default function AdminSection({ token, addToast }: AdminSectionProps) {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [stats, setStats] = useState({
    usersCount: 0,
    postsCount: 0,
    storiesCount: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [token]);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setReports(data.reports);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err);
    }
  };

  const handleResolveReport = async (reportId: string, action: 'dismiss' | 'confirm') => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      if (response.ok) {
        setReports(reports.map(r => r.id === reportId ? { ...r, status: action === 'confirm' ? 'resolved' : 'dismissed' } : r));
        fetchStats();
        addToast('success', `Report successfully ${action === 'confirm' ? 'confirmed & resolved' : 'dismissed'}.`);
      }
    } catch (err) {
      console.error('Failed to resolve report', err);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 text-left" id="admin-section-root">
      
      {/* Title Header bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-100 dark:border-slate-900 pb-5" id="admin-header-bar">
        <div>
          <h2 className="font-display text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <Shield className="h-6 w-6 text-amber-500 animate-pulse" />
            <span>Lantern Safety Operations Control</span>
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Monitor platform metrics, process moderation logs, and safeguard community guidelines.
          </p>
        </div>
        
        <span className="py-1 px-3 bg-amber-500/10 text-amber-600 dark:text-amber-500 text-xs font-bold rounded-lg border border-amber-500/20">
          Admin Clearance Level 1
        </span>
      </div>

      {/* Stats Cards grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="admin-stats-grid">
        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-theme-text">{stats.usersCount}</span>
            <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Total Creators</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-theme-text">{stats.postsCount}</span>
            <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Active Posts</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-theme-primary/10 text-theme-primary flex items-center justify-center">
            <Flame className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-theme-text">{stats.storiesCount}</span>
            <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Live Stories</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-theme-card border border-theme-border shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-xl font-bold text-theme-text">{stats.pendingReports}</span>
            <span className="text-[10px] text-theme-muted font-bold uppercase tracking-wider">Pending Alerts</span>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-6" id="moderation-queue-card">
        <div className="flex justify-between items-center border-b border-theme-border pb-4">
          <h3 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-rose-500 animate-pulse" />
            <span>Open Moderation Incidents</span>
          </h3>
          <span className="text-xs text-theme-muted font-medium">Pending Review Priority Q</span>
        </div>

        {reports.length > 0 ? (
          <div className="divide-y divide-theme-border/60" id="reports-list">
            {reports.map((rep) => {
              const isPending = rep.status === 'pending';
              return (
                <div key={rep.id} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4" id={`report-row-${rep.id}`}>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
                        {rep.targetType.toUpperCase()}
                      </span>
                      <span className="text-xs text-theme-muted font-medium">
                        Reported by @{rep.reporter?.username || 'unknown'} • {new Date(rep.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-theme-text">
                      Reason: <span className="font-normal text-theme-text/80 italic">“{rep.reason}”</span>
                    </p>

                    {rep.targetPost && (
                      <div className="text-xs bg-theme-secondary/20 p-3 rounded-xl border border-theme-border mt-1 max-w-xl text-theme-text/70 leading-relaxed">
                        <strong className="text-theme-text">Target Content:</strong> {rep.targetPost.content}
                      </div>
                    )}
                  </div>

                  {/* Resolutions */}
                  <div className="flex gap-2">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismiss')}
                          className="py-1.5 px-3 rounded-xl border border-theme-border text-xs font-semibold text-theme-muted hover:bg-theme-secondary/30 transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'confirm')}
                          className="py-1.5 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold flex items-center gap-1 shadow-md shadow-rose-500/10 transition-colors cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Resolve (Confirm Infraction)</span>
                        </button>
                      </>
                    ) : (
                      <span className={`text-xs font-bold capitalize px-3 py-1 rounded-full ${
                        rep.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-theme-secondary/20 text-theme-muted'
                      }`}>
                        {rep.status}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-theme-muted" id="reports-empty-state">
            Excellent! The safety ledger is fully clear. There are no active reports filed for investigation.
          </div>
        )}
      </div>
    </div>
  );
}
