/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SettingsState {
  // Account
  displayName: string;
  username: string;
  email: string;
  avatarUrl: string;
  coverUrl: string;
  emailVerified: boolean;
  phoneNumber: string;
  birthday: string;
  
  // Appearance
  accentColor: string;
  fontFamily: string;
  fontSize: string;
  density: string; // 'compact' | 'comfortable' | 'spacious'
  borderRadius: string; // 'none' | 'small' | 'medium' | 'large'
  sidebarWidth: string; // 'thin' | 'standard' | 'wide'
  sidebarPosition: string; // 'left' | 'right'
  cardStyle: string; // 'flat' | 'elevated' | 'paper'
  blurIntensity: string; // 'none' | 'low' | 'medium' | 'high'
  shadowIntensity: string; // 'none' | 'low' | 'medium' | 'high'
  animationSpeed: string; // 'instant' | 'fast' | 'normal' | 'slow'
  reduceMotion: boolean;
  compactMode: boolean;
  readingMode: boolean;
  highContrastMode: boolean;
  amoledMode: boolean;

  // Notifications
  likes: boolean;
  comments: boolean;
  replies: boolean;
  mentions: boolean;
  followers: boolean;
  followRequests: boolean;
  messages: boolean;
  storyViews: boolean;
  storyReplies: boolean;
  savedPostReminders: boolean;
  securityAlerts: boolean;
  productAnnouncements: boolean;
  deliveryInApp: boolean;
  deliveryEmail: boolean;
  deliveryPush: boolean;
  deliveryDesktop: boolean;
  notificationSound: boolean;
  vibration: boolean;
  quietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  notificationPreview: boolean;
  groupNotifications: boolean;

  // Privacy
  profileVisibility: string; // 'public' | 'followers' | 'private'
  whoCanViewPosts: string; // 'everyone' | 'followers' | 'only_me'
  whoCanComment: string; // 'everyone' | 'followers' | 'nobody'
  whoCanMention: string; // 'everyone' | 'followers' | 'nobody'
  whoCanTag: string; // 'everyone' | 'followers' | 'nobody'
  whoCanShare: string; // 'everyone' | 'followers' | 'nobody'
  whoCanMessage: string; // 'everyone' | 'followers' | 'nobody'
  hiddenWords: string;
  hiddenHashtags: string;
  hiddenMentions: string;
  sensitiveFilter: boolean;
  nsfwFilter: boolean;
  adultBlur: boolean;
  blockedUsers: string[];
  mutedUsers: string[];
  restrictedUsers: string[];

  // Security
  twoFactorEnabled: boolean;
  passkeysEnabled: boolean;
  backupCodes: string[];
  connectedDevices: string[];
  browserSessions: string[];
  recentSecurityEvents: string[];
  recoveryEmail: string;

  // Language & Region
  language: string;
  country: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  weekStartDay: string;

  // Accessibility
  keyboardNavigation: boolean;
  screenReaderImprovements: boolean;
  largerText: boolean;
  largerButtons: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  colorBlindSupport: string; // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia'
  dyslexiaFont: boolean;
  focusIndicators: boolean;

  // Media & Performance
  autoplayVideos: boolean;
  videoQuality: string; // 'low' | 'auto' | 'high'
  imageQuality: string; // 'low' | 'auto' | 'high'
  dataSaver: boolean;
  cacheSize: number; // MB
  lazyLoadingPreference: boolean;
  preloadImages: boolean;
  reduceBackgroundRequests: boolean;

  // Feed Preferences
  defaultFeed: string; // 'home' | 'following' | 'latest'
  hideSeenPosts: boolean;
  hideSponsoredContent: boolean;
  hideReposts: boolean;
  hideStories: boolean;
  hideSuggestedUsers: boolean;
  showSensitiveContent: boolean;
  preferredContentLanguage: string;
  preferredTopics: string;
  mutedTopics: string;

  // AI Features
  aiCaptionSuggestions: boolean;
  aiWritingAssistant: boolean;
  aiContentSummary: boolean;
  aiSearch: boolean;
  aiTranslation: boolean;
  aiCommentSuggestions: boolean;

  // Experimental
  betaFeatures: boolean;
  labs: boolean;
  previewUpcomingUi: boolean;
  enableDebugOverlay: boolean;
  enablePerformanceMetrics: boolean;
  developerMode: boolean;

  // Personalization
  favoriteEmoji: string;
  favoriteTheme: string;
  profileAccentColor: string;
  profileCardStyle: string;
  customProfileBanner: string;
  profileMusicEnabled: boolean;
  profileBadgeSelection: string;
  favoriteCategories: string;
}

export const defaultSettings: SettingsState = {
  displayName: '',
  username: '',
  email: '',
  avatarUrl: '',
  coverUrl: '',
  emailVerified: false,
  phoneNumber: '',
  birthday: '',

  accentColor: 'lantern-orange',
  fontFamily: 'sans',
  fontSize: 'medium',
  density: 'comfortable',
  borderRadius: 'medium',
  sidebarWidth: 'standard',
  sidebarPosition: 'left',
  cardStyle: 'elevated',
  blurIntensity: 'medium',
  shadowIntensity: 'medium',
  animationSpeed: 'normal',
  reduceMotion: false,
  compactMode: false,
  readingMode: false,
  highContrastMode: false,
  amoledMode: false,

  likes: true,
  comments: true,
  replies: true,
  mentions: true,
  followers: true,
  followRequests: false,
  messages: true,
  storyViews: true,
  storyReplies: true,
  savedPostReminders: true,
  securityAlerts: true,
  productAnnouncements: false,
  deliveryInApp: true,
  deliveryEmail: true,
  deliveryPush: true,
  deliveryDesktop: false,
  notificationSound: true,
  vibration: true,
  quietHours: false,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  notificationPreview: true,
  groupNotifications: true,

  profileVisibility: 'public',
  whoCanViewPosts: 'everyone',
  whoCanComment: 'everyone',
  whoCanMention: 'everyone',
  whoCanTag: 'everyone',
  whoCanShare: 'everyone',
  whoCanMessage: 'everyone',
  hiddenWords: 'spam, crypto, free tokens',
  hiddenHashtags: '#spam, #clickbait',
  hiddenMentions: '@spambot',
  sensitiveFilter: true,
  nsfwFilter: true,
  adultBlur: true,
  blockedUsers: ['spammer_bot', 'ad_node'],
  mutedUsers: ['loud_reposter'],
  restrictedUsers: [],

  twoFactorEnabled: false,
  passkeysEnabled: false,
  backupCodes: ['4B8F-9C3E', '7D2A-1E6B', '9F5C-8D4A', '3A1C-2B7E'],
  connectedDevices: ['MacBook Pro (Chrome)', 'iPhone 15 (Safari)', 'Linux Node (Firefox)'],
  browserSessions: ['Active Session: San Francisco, CA (IP: 192.168.1.55)'],
  recentSecurityEvents: ['Password updated successfully (3 days ago)'],
  recoveryEmail: 'cloryn.recovery@gmail.com',

  language: 'en',
  country: 'US',
  timezone: 'America/Los_Angeles',
  dateFormat: 'YYYY-MM-DD',
  timeFormat: '12h',
  numberFormat: 'comma',
  weekStartDay: 'sunday',

  keyboardNavigation: false,
  screenReaderImprovements: false,
  largerText: false,
  largerButtons: false,
  reducedMotion: false,
  highContrast: false,
  colorBlindSupport: 'none',
  dyslexiaFont: false,
  focusIndicators: true,

  autoplayVideos: true,
  videoQuality: 'auto',
  imageQuality: 'high',
  dataSaver: false,
  cacheSize: 45.2,
  lazyLoadingPreference: true,
  preloadImages: true,
  reduceBackgroundRequests: false,

  defaultFeed: 'home',
  hideSeenPosts: false,
  hideSponsoredContent: true,
  hideReposts: false,
  hideStories: false,
  hideSuggestedUsers: false,
  showSensitiveContent: false,
  preferredContentLanguage: 'en',
  preferredTopics: 'ambient software, minimalism, typographic arts',
  mutedTopics: 'spoiler alerts',

  aiCaptionSuggestions: true,
  aiWritingAssistant: false,
  aiContentSummary: true,
  aiSearch: true,
  aiTranslation: true,
  aiCommentSuggestions: false,

  betaFeatures: false,
  labs: false,
  previewUpcomingUi: false,
  enableDebugOverlay: false,
  enablePerformanceMetrics: false,
  developerMode: false,

  favoriteEmoji: '🏮',
  favoriteTheme: 'lantern',
  profileAccentColor: '#E28743',
  profileCardStyle: 'glassy',
  customProfileBanner: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  profileMusicEnabled: false,
  profileBadgeSelection: 'founding_storyteller',
  favoriteCategories: 'typographic aesthetics, software poetry'
};
