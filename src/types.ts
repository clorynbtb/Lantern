/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// ============================================================================
// CORE ENTITIES (NORMALIZED DATABASE REPRESENTATION)
// ============================================================================

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Cryptographically hashed
  username: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Profile {
  userId: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  website: string;
  location: string;
  isPrivate: boolean;
  themePreference: string;
  settings?: string;
}

export interface Media {
  id: string;
  postId?: string;
  storyId?: string;
  url: string;
  type: 'image' | 'video';
  order: number;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  tags: string[]; // inline array of hashtags for quick querying
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  createdAt: string;
}

export interface Like {
  id: string;
  userId: string;
  postId?: string;
  commentId?: string;
  createdAt: string;
}

export interface Follow {
  id: string;
  followerId: string; // The user who follows
  followingId: string; // The user being followed
  createdAt: string;
}

export interface Notification {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'like' | 'comment' | 'follow' | 'mention' | 'message';
  postId?: string;
  commentId?: string;
  messageId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  name?: string; // Optional group name
  isGroup: boolean;
  participants: string[]; // User IDs
  lastMessageText?: string;
  lastMessageAt?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  isSeen: boolean;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  expiresAt: string; // 24 hours after creation
  createdAt: string;
}

export interface StoryView {
  id: string;
  storyId: string;
  viewerId: string;
  createdAt: string;
}

export interface SavedPost {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'user' | 'post' | 'comment';
  targetId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

export interface Hashtag {
  id: string;
  tag: string; // strictly lowercase, alphanumeric
  postCount: number;
}

export interface PostHashtag {
  id: string;
  postId: string;
  hashtagId: string;
}

// ============================================================================
// API RESPONSES & COMPOSITIONAL TYPES (FOR FRONTEND VIEWS)
// ============================================================================

export interface UserSummary {
  id: string;
  username: string;
  name: string;
  avatarUrl: string;
  isFollowing?: boolean;
}

export interface PostWithAuthor extends Post {
  author: UserSummary;
  media: Media[];
  isLiked: boolean;
  isSaved: boolean;
}

export interface CommentWithAuthor extends Comment {
  author: UserSummary;
}

export interface MessageWithSender extends Message {
  sender: UserSummary;
}

export interface StoryWithAuthor extends Story {
  author: UserSummary;
  views?: UserSummary[];
  isViewed?: boolean;
}

export interface ConversationWithDetails extends Conversation {
  displayName: string;
  displayAvatar: string;
  participantsDetails: UserSummary[];
  unreadCount: number;
}

export interface NotificationWithDetails extends Notification {
  sender: UserSummary;
  postContent?: string;
}

export interface AdminStats {
  usersCount: number;
  postsCount: number;
  storiesCount: number;
  reportsCount: number;
  activeUsers24h: number;
}

export interface ReportWithDetails extends Report {
  reporter?: UserSummary;
  targetPost?: Post;
}
