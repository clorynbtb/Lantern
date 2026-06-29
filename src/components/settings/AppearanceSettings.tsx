/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Palette, 
  Accessibility, 
  Smile, 
  Type, 
  Sliders, 
  Eye, 
  Sparkles,
  Layers,
  ChevronDown,
  Volume2
} from 'lucide-react';
import { SettingsState } from './types.ts';
import { THEMES } from '../../lib/themes.ts';

interface AppearanceSettingsProps {
  settings: SettingsState;
  updateSetting: <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => void;
  onSetTheme: (theme: string) => void;
  currentTheme: string;
  addToast: (type: 'success' | 'error' | 'info', text: string) => void;
}

export default function AppearanceSettings({
  settings,
  updateSetting,
  onSetTheme,
  currentTheme,
  addToast
}: AppearanceSettingsProps) {

  const handlePresetClick = (themeId: string) => {
    onSetTheme(themeId);
    updateSetting('favoriteTheme', themeId);
    addToast('success', `Theme preset configured to ${THEMES[themeId]?.name || themeId}`);
  };

  const fonts = [
    { id: 'sans', label: 'Inter Sans', desc: 'Sleek, highly readable display letters.' },
    { id: 'serif', label: 'Editorial Serif', desc: 'Charming letters with vintage press accents.' },
    { id: 'mono', label: 'JetBrains Mono', desc: 'Clean mechanical lettering with even spacing.' },
    { id: 'dyslexia', label: 'Dyslexia Open', desc: 'Bottom-heavy weighted letters to support focus.' }
  ];

  const cardStyles = [
    { id: 'flat', label: 'Flat Cardboard', desc: 'Zero shadows, simple borders.' },
    { id: 'elevated', label: 'Floating Cushion', desc: 'Delicate borders with ambient drop shadows.' },
    { id: 'paper', label: 'Press Paper', desc: 'Soft outline, neutral tactile backdrop.' }
  ];

  return (
    <div className="space-y-6 text-left" id="settings-appearance-panel">
      
      {/* 🎨 Theme preset grid */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Palette className="h-5 w-5 text-theme-primary" />
          <span>Core Aesthetic Preset</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Select an eye-safe environment layout. Each theme comes configured with a beautiful color-led palette.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
          {Object.values(THEMES).map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handlePresetClick(t.id)}
                className={`p-3.5 rounded-2xl border flex flex-col items-start gap-2.5 transition-all cursor-pointer relative overflow-hidden group text-left ${
                  isSelected
                    ? 'border-theme-primary bg-theme-primary/10 shadow-sm scale-[1.02]'
                    : 'border-theme-border bg-theme-card hover:bg-theme-secondary/40 hover:border-theme-primary/25'
                }`}
              >
                <div className="flex gap-1">
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-350/15" style={{ backgroundColor: t.colors.primary }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-350/15" style={{ backgroundColor: t.colors.bg }} />
                  <span className="w-2.5 h-2.5 rounded-full border border-neutral-350/15" style={{ backgroundColor: t.colors.text }} />
                </div>
                <div>
                  <span className={`text-xs font-bold block ${isSelected ? 'text-theme-primary' : 'text-theme-text'}`}>
                    {t.name}
                  </span>
                  <span className="text-[9px] text-theme-muted block capitalize">
                    {t.isDark ? 'Dark Theme' : 'Light Theme'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🛠 Interactive Appearance Parameters */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-5">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Sliders className="h-5 w-5 text-theme-primary" />
          <span>Advanced Theme Customizers</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Fine-tune accents, font frames, padding metrics, blur limits, and layouts to suit your exact visual style.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Accent Overrides */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">Custom Accent Overlay</span>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'lantern-orange', color: '#E28743', label: 'Orange' },
                { id: 'amber', color: '#D97706', label: 'Amber' },
                { id: 'indigo', color: '#6366F1', label: 'Indigo' },
                { id: 'rose', color: '#EC4899', label: 'Rose' },
                { id: 'emerald', color: '#10B981', label: 'Emerald' }
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    updateSetting('accentColor', c.id);
                    addToast('success', `Accent color altered to ${c.label}`);
                  }}
                  className={`w-7 h-7 rounded-full border flex items-center justify-center transition-transform relative cursor-pointer ${
                    settings.accentColor === c.id ? 'border-theme-primary scale-110 shadow-sm' : 'border-theme-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.color }}
                  title={c.label}
                >
                  {settings.accentColor === c.id && <span className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />}
                </button>
              ))}
            </div>
          </div>

          {/* Font Sizes */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-theme-muted uppercase tracking-wider block">UI Text Scale</span>
            <div className="grid grid-cols-3 gap-1.5">
              {['small', 'medium', 'large'].map((sz) => (
                <button
                  key={sz}
                  onClick={() => updateSetting('fontSize', sz)}
                  className={`py-1.5 rounded-xl border text-[10px] font-bold text-center capitalize cursor-pointer ${
                    settings.fontSize === sz ? 'bg-theme-primary/15 border-theme-primary text-theme-primary' : 'bg-theme-secondary/20 border-theme-border text-theme-text'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-theme-border pt-4">
          {/* Card Styles */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-theme-muted uppercase block">Card Border Style</span>
            <div className="space-y-1.5">
              {cardStyles.map((cs) => (
                <button
                  key={cs.id}
                  onClick={() => updateSetting('cardStyle', cs.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer ${
                    settings.cardStyle === cs.id ? 'bg-theme-primary/10 border-theme-primary' : 'bg-theme-secondary/15 border-theme-border hover:bg-theme-secondary/30'
                  }`}
                >
                  <div className="mt-0.5">
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${settings.cardStyle === cs.id ? 'border-theme-primary' : 'border-theme-muted'}`}>
                      {settings.cardStyle === cs.id && <span className="w-1.5 h-1.5 rounded-full bg-theme-primary" />}
                    </span>
                  </div>
                  <div>
                    <span className={`text-xs font-bold block ${settings.cardStyle === cs.id ? 'text-theme-primary' : 'text-theme-text'}`}>{cs.label}</span>
                    <span className="text-[9px] text-theme-muted block">{cs.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Font Family Choice */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-theme-muted uppercase block">Typography Pairing</span>
            <div className="space-y-1.5">
              {fonts.map((f) => (
                <button
                  key={f.id}
                  onClick={() => updateSetting('fontFamily', f.id)}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-start gap-2 cursor-pointer ${
                    settings.fontFamily === f.id ? 'bg-theme-primary/10 border-theme-primary' : 'bg-theme-secondary/15 border-theme-border hover:bg-theme-secondary/30'
                  }`}
                >
                  <Type className={`h-4.5 w-4.5 mt-0.5 ${settings.fontFamily === f.id ? 'text-theme-primary' : 'text-theme-muted'}`} />
                  <div>
                    <span className={`text-xs font-bold block ${settings.fontFamily === f.id ? 'text-theme-primary' : 'text-theme-text'}`}>{f.label}</span>
                    <span className="text-[9px] text-theme-muted block">{f.desc}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick parameters list */}
        <div className="border-t border-theme-border pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Sliders / Selectors */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">UI Spacing Density</label>
              <select
                value={settings.density}
                onChange={(e) => updateSetting('density', e.target.value)}
                className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              >
                <option value="compact">Compact (Squeezed layout, max density)</option>
                <option value="comfortable">Comfortable (Balanced padding)</option>
                <option value="spacious">Spacious (Spacious negative space)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Border Roundness</label>
              <select
                value={settings.borderRadius}
                onChange={(e) => updateSetting('borderRadius', e.target.value)}
                className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              >
                <option value="none">Flat Corners (90° sharp borders)</option>
                <option value="small">Small (Soft organic curve)</option>
                <option value="medium">Medium (Standard modern roundness)</option>
                <option value="large">Large (High-contrast round pill cushions)</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Sidebar Location & Width</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <select
                  value={settings.sidebarPosition}
                  onChange={(e) => updateSetting('sidebarPosition', e.target.value)}
                  className="text-xs px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
                >
                  <option value="left">Left Rail</option>
                  <option value="right">Right Rail</option>
                </select>
                <select
                  value={settings.sidebarWidth}
                  onChange={(e) => updateSetting('sidebarWidth', e.target.value)}
                  className="text-xs px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
                >
                  <option value="thin">Thin (192px)</option>
                  <option value="standard">Standard (256px)</option>
                  <option value="wide">Wide (320px)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Right toggle list */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Visual Special Effects</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <select
                  value={settings.blurIntensity}
                  onChange={(e) => updateSetting('blurIntensity', e.target.value)}
                  className="text-xs px-2 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
                >
                  <option value="none">No Blur (Low CPU)</option>
                  <option value="low">Low Blur (4px)</option>
                  <option value="medium">Standard Blur (16px)</option>
                  <option value="high">Immersive Blur (32px)</option>
                </select>
                <select
                  value={settings.shadowIntensity}
                  onChange={(e) => updateSetting('shadowIntensity', e.target.value)}
                  className="text-xs px-2 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
                >
                  <option value="none">Zero Shadow</option>
                  <option value="low">Subtle Cast</option>
                  <option value="medium">Soft Drop</option>
                  <option value="high">Deep Dimensional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-theme-muted uppercase block">Animation Cadence</label>
              <select
                value={settings.animationSpeed}
                onChange={(e) => updateSetting('animationSpeed', e.target.value)}
                className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              >
                <option value="instant">Instantaneous (0ms, snappy)</option>
                <option value="fast">Brisk Motion (100ms)</option>
                <option value="normal">Standard Bounce (200ms)</option>
                <option value="slow">Ambient Float (450ms)</option>
              </select>
            </div>

            {/* Quick layout checkboxes */}
            <div className="space-y-2 pt-1.5">
              {[
                { id: 'compactMode', label: 'Compact Layout Mode' },
                { id: 'readingMode', label: 'Focused Reading Canvas' },
                { id: 'amoledMode', label: 'AMOLED Pure pitch-black' }
              ].map((chk) => (
                <label key={chk.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings as any)[chk.id]}
                    onChange={(e) => updateSetting(chk.id as any, e.target.checked)}
                    className="rounded text-theme-primary focus:ring-theme-primary w-4 h-4"
                  />
                  <span className="text-[11px] text-theme-text font-bold">{chk.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ♿ Accessibility Support Section */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Accessibility className="h-5 w-5 text-theme-primary" />
          <span>Interactive Accessibility (A11y)</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Enable helper technologies including high contrast layouts, dyslexia-friendly fonts, and keyboard cursor triggers.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {[
            { id: 'keyboardNavigation', label: 'Visual Keyboard Navigation Carets', desc: 'Highlight active focus items with custom high-contrast halos.' },
            { id: 'screenReaderImprovements', label: 'Optimize Screen Reader Tags', desc: 'Inject detailed aria descriptors to feed logs.' },
            { id: 'largerText', label: 'Enlarge Body Typography Scales', desc: 'Render readability blocks at increased size limits.' },
            { id: 'largerButtons', label: 'Expanded Pointer Targets (44px)', desc: 'Puff buttons and checklist targets to meet thumb safety rules.' },
            { id: 'reduceMotion', label: 'Disable System Animations', desc: 'Toggle off structural motion and layout flows.' },
            { id: 'highContrast', label: 'Absolute Contrast Canvas (B&W)', desc: 'Force high-ratio boundaries between texts and elements.' },
            { id: 'focusIndicators', label: 'Permanent Cursor Indicators', desc: 'Keep custom visual anchors active under headings.' }
          ].map((acc) => (
            <label key={acc.id} className="p-3 bg-theme-secondary/15 rounded-xl border border-theme-border/60 hover:bg-theme-secondary/30 transition-all flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings as any)[acc.id]}
                onChange={(e) => updateSetting(acc.id as any, e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4.5 h-4.5 mt-0.5"
              />
              <div>
                <span className="block text-xs font-bold text-theme-text">{acc.label}</span>
                <span className="text-[9px] text-theme-muted mt-0.5 block leading-relaxed">{acc.desc}</span>
              </div>
            </label>
          ))}
        </div>

        <div>
          <label className="text-[10px] font-bold text-theme-muted uppercase block">Color Vision Support</label>
          <select
            value={settings.colorBlindSupport}
            onChange={(e) => updateSetting('colorBlindSupport', e.target.value)}
            className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
          >
            <option value="none">Standard Vision (No Color Assistance)</option>
            <option value="protanopia">Protanopia Assist (Red-Green Deficit)</option>
            <option value="deuteranopia">Deuteranopia Assist (Green-Red Deficit)</option>
            <option value="tritanopia">Tritanopia Assist (Blue-Yellow Deficit)</option>
          </select>
        </div>
      </div>

      {/* 🎮 Profile Custom Personalization */}
      <div className="p-6 rounded-3xl bg-theme-card border border-theme-border shadow-sm space-y-4">
        <h4 className="font-display font-bold text-base text-theme-text flex items-center gap-2">
          <Smile className="h-5 w-5 text-theme-primary" />
          <span>Interactive Profile Personalization</span>
        </h4>
        <p className="text-xs text-theme-muted leading-relaxed">
          Configure bespoke decorations representing your storytelling style.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Favorite Emoji Stamp</label>
            <input
              type="text"
              value={settings.favoriteEmoji}
              onChange={(e) => updateSetting('favoriteEmoji', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              placeholder="🏮"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Profile Accent Hex</label>
            <input
              type="text"
              value={settings.profileAccentColor}
              onChange={(e) => updateSetting('profileAccentColor', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              placeholder="#E28743"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Custom Profile Cover Banner URL</label>
            <input
              type="text"
              value={settings.customProfileBanner}
              onChange={(e) => updateSetting('customProfileBanner', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Aesthetic Profile Card Style</label>
            <select
              value={settings.profileCardStyle}
              onChange={(e) => updateSetting('profileCardStyle', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
            >
              <option value="glassy">Frosted Glass (Lucid, blurred)</option>
              <option value="brutalist">Brutalist (Sharp outline, flat color)</option>
              <option value="aurora">Aurora Neon Glow (Radial gradients)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Profile Badge Selection</label>
            <select
              value={settings.profileBadgeSelection}
              onChange={(e) => updateSetting('profileBadgeSelection', e.target.value)}
              className="w-full text-xs mt-1 px-3 py-2 bg-theme-secondary/40 rounded-xl border border-theme-border text-theme-text outline-none"
            >
              <option value="founding_storyteller">Founding Storyteller 🏮</option>
              <option value="aesthetic_shaper">Aesthetic Shaper 🎨</option>
              <option value="zen_philosopher">Zen Philosopher 🌿</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-theme-muted uppercase block">Ambient Music Tracker (Future)</label>
            <label className="flex items-center gap-2.5 p-2 bg-theme-secondary/20 rounded-xl border border-theme-border mt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.profileMusicEnabled}
                onChange={(e) => updateSetting('profileMusicEnabled', e.target.checked)}
                className="rounded text-theme-primary focus:ring-theme-primary w-4 h-4"
              />
              <span className="text-xs text-theme-text font-semibold flex items-center gap-1.5">
                <Volume2 className="h-4 w-4 text-theme-primary animate-bounce" /> Enable profile background music
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

export function applyAppearanceSettings(settings: any) {
  const root = document.documentElement;
  
  // 1. Accent color
  if (settings.accentColor === 'lantern-orange') {
    root.style.setProperty('--theme-primary', '#E28743');
    root.style.setProperty('--theme-primary-hover', '#C16723');
  } else if (settings.accentColor === 'amber') {
    root.style.setProperty('--theme-primary', '#D97706');
    root.style.setProperty('--theme-primary-hover', '#B45309');
  } else if (settings.accentColor === 'indigo') {
    root.style.setProperty('--theme-primary', '#6366F1');
    root.style.setProperty('--theme-primary-hover', '#4F46E5');
  } else if (settings.accentColor === 'rose') {
    root.style.setProperty('--theme-primary', '#EC4899');
    root.style.setProperty('--theme-primary-hover', '#DB2777');
  } else if (settings.accentColor === 'emerald') {
    root.style.setProperty('--theme-primary', '#10B981');
    root.style.setProperty('--theme-primary-hover', '#059669');
  }

  // 2. Font family Choice
  if (settings.fontFamily === 'sans') {
    root.style.setProperty('--font-sans', '"Inter", ui-sans-serif, system-ui, sans-serif');
    root.style.setProperty('font-family', 'var(--font-sans)');
  } else if (settings.fontFamily === 'serif') {
    root.style.setProperty('--font-sans', 'Georgia, Cambria, "Times New Roman", Times, serif');
    root.style.setProperty('font-family', 'var(--font-sans)');
  } else if (settings.fontFamily === 'mono') {
    root.style.setProperty('--font-sans', '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace');
    root.style.setProperty('font-family', 'var(--font-sans)');
  } else if (settings.fontFamily === 'dyslexia') {
    root.style.setProperty('--font-sans', '"Comic Sans MS", cursive, sans-serif');
    root.style.setProperty('font-family', 'var(--font-sans)');
  }

  // 3. Font Size Scale
  if (settings.fontSize === 'small') {
    root.style.setProperty('font-size', '13px');
  } else if (settings.fontSize === 'medium') {
    root.style.setProperty('font-size', '15px');
  } else if (settings.fontSize === 'large') {
    root.style.setProperty('font-size', '18px');
  }

  // 4. Border Radius Shape
  if (settings.borderRadius === 'none') {
    root.style.setProperty('--theme-radius', '0px');
  } else if (settings.borderRadius === 'small') {
    root.style.setProperty('--theme-radius', '6px');
  } else if (settings.borderRadius === 'medium') {
    root.style.setProperty('--theme-radius', '12px');
  } else if (settings.borderRadius === 'large') {
    root.style.setProperty('--theme-radius', '24px');
  }

  // 5. Spacing Density
  if (settings.density === 'compact') {
    root.style.setProperty('--theme-spacing-multiplier', '0.7');
  } else if (settings.density === 'comfortable') {
    root.style.setProperty('--theme-spacing-multiplier', '1.0');
  } else if (settings.density === 'spacious') {
    root.style.setProperty('--theme-spacing-multiplier', '1.3');
  }

  // 6. AMOLED Mode (Forces background to pitch black)
  if (settings.amoledMode) {
    root.style.setProperty('--theme-bg', '#000000');
    root.style.setProperty('--theme-surface', '#050505');
    root.style.setProperty('--theme-card', '#070707');
  }
  
  // 7. Glass Effect / Blur intensity
  if (settings.blurIntensity === 'none') {
    root.style.setProperty('--theme-blur', '0px');
  } else if (settings.blurIntensity === 'low') {
    root.style.setProperty('--theme-blur', '4px');
  } else if (settings.blurIntensity === 'medium') {
    root.style.setProperty('--theme-blur', '16px');
  } else if (settings.blurIntensity === 'high') {
    root.style.setProperty('--theme-blur', '32px');
  }

  // 8. Shadow Intensity
  if (settings.shadowIntensity === 'none') {
    root.style.setProperty('--theme-shadow', 'none');
  } else if (settings.shadowIntensity === 'low') {
    root.style.setProperty('--theme-shadow', '0 2px 8px rgba(0,0,0,0.04)');
  } else if (settings.shadowIntensity === 'medium') {
    root.style.setProperty('--theme-shadow', '0 4px 20px rgba(0,0,0,0.08)');
  } else if (settings.shadowIntensity === 'high') {
    root.style.setProperty('--theme-shadow', '0 12px 40px rgba(0,0,0,0.16)');
  }

  // 9. Reduce Motion / Animation duration overrides
  if (settings.reduceMotion || settings.animationSpeed === 'instant') {
    root.style.setProperty('--theme-transition-duration', '0ms');
  } else if (settings.animationSpeed === 'fast') {
    root.style.setProperty('--theme-transition-duration', '100ms');
  } else if (settings.animationSpeed === 'normal') {
    root.style.setProperty('--theme-transition-duration', '200ms');
  } else if (settings.animationSpeed === 'slow') {
    root.style.setProperty('--theme-transition-duration', '450ms');
  }

  // 10. High Contrast Mode
  if (settings.highContrast) {
    root.style.setProperty('--theme-text', '#000000');
    root.style.setProperty('--theme-bg', '#FFFFFF');
    root.style.setProperty('--theme-card', '#FFFFFF');
    root.style.setProperty('--theme-border', '#000000');
    root.style.setProperty('--theme-primary', '#000000');
    root.style.setProperty('--theme-muted', '#000000');
    root.classList.remove('dark');
  }
}

