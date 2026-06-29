/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import cryptoNode from 'crypto';
import { supabase } from './supabase';
import type {
  User, Profile, Post, Media, Comment, Like, Follow,
  Notification, Conversation, Message, Story, StoryView,
  SavedPost, Report, Hashtag, PostHashtag, AdminStats
} from '../src/types';

export function hashPassword(password: string): string {
  return cryptoNode.createHash('sha256').update(password + '_lantern_salt').digest('hex');
}

function generateId(): string {
  return cryptoNode.randomBytes(8).toString('hex');
}

export class Database {
  // =================== READ ===================

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapUserRow);
  }

  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapUserRow(data) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').ilike('username', username.trim()).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapUserRow(data) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').ilike('email', email.trim()).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapUserRow(data) : undefined;
  }

  async getProfile(userId: string): Promise<Profile | undefined> {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapProfileRow(data) : undefined;
  }

  async getFollowers(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase.from('follows').select('*').eq('following_id', userId);
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFollowRow);
  }

  async getFollowing(userId: string): Promise<Follow[]> {
    const { data, error } = await supabase.from('follows').select('*').eq('follower_id', userId);
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapFollowRow);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async getPosts(): Promise<Post[]> {
    const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapPostRow);
  }

  async getPostById(id: string): Promise<Post | undefined> {
    const { data, error } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ? this.mapPostRow(data) : undefined;
  }

  async getPostMedia(postId: string): Promise<Media[]> {
    const { data, error } = await supabase.from('media').select('*').eq('post_id', postId).order('order', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapMediaRow);
  }

  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapCommentRow);
  }

  async getLikes(postId: string): Promise<Like[]> {
    const { data, error } = await supabase.from('likes').select('*').eq('post_id', postId);
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapLikeRow);
  }

  async isPostLiked(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async isPostSaved(userId: string, postId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return !!data;
  }

  async getSavedPosts(userId: string): Promise<SavedPost[]> {
    const { data, error } = await supabase.from('saved_posts').select('*').eq('user_id', userId);
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapSavedPostRow);
  }

  async getStories(): Promise<Story[]> {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapStoryRow);
  }

  async getStoryViews(storyId: string): Promise<StoryView[]> {
    const { data, error } = await supabase.from('story_views').select('*').eq('story_id', storyId);
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapStoryViewRow);
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    const ids = (data || []).map((d: any) => d.conversation_id);
    if (ids.length === 0) return [];
    const { data: convs, error: convErr } = await supabase
      .from('conversations')
      .select('*')
      .in('id', ids)
      .order('last_message_at', { ascending: false });
    if (convErr) throw new Error(convErr.message);
    return (convs || []).map(this.mapConversationRow);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapMessageRow);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('receiver_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapNotificationRow);
  }

  async getReports(): Promise<Report[]> {
    const { data, error } = await supabase.from('reports').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapReportRow);
  }

  async getHashtags(): Promise<Hashtag[]> {
    const { data, error } = await supabase.from('hashtags').select('*');
    if (error) throw new Error(error.message);
    return (data || []).map(this.mapHashtagRow);
  }

  // =================== WRITE ===================

  async createUser(email: string, passwordHash: string, username: string, name: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({ email: email.toLowerCase().trim(), password_hash: passwordHash, username: username.toLowerCase().trim(), name: name.trim() } as any)
      .select()
      .single();
    if (error) throw new Error(error.message);
    const user = this.mapUserRow(data);
    // Create default profile
    await supabase.from('profiles').insert({
      user_id: user.id,
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      cover_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
      bio: '', website: '', location: '', is_private: false, theme_preference: 'light', settings: {}
    });
    return user;
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile | undefined> {
    const dbUpdates: any = {};
    if (updates.avatarUrl !== undefined) dbUpdates.avatar_url = updates.avatarUrl;
    if (updates.coverUrl !== undefined) dbUpdates.cover_url = updates.coverUrl;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.website !== undefined) dbUpdates.website = updates.website;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.isPrivate !== undefined) dbUpdates.is_private = updates.isPrivate;
    if (updates.themePreference !== undefined) dbUpdates.theme_preference = updates.themePreference;
    if (updates.settings !== undefined) dbUpdates.settings = typeof updates.settings === 'string' ? JSON.parse(updates.settings) : updates.settings;
    const { data, error } = await supabase.from('profiles').update(dbUpdates).eq('user_id', userId).select().single();
    if (error) throw new Error(error.message);
    return data ? this.mapProfileRow(data) : undefined;
  }

  async updateUser(userId: string, updates: { name?: string; username?: string; passwordHash?: string }): Promise<User | undefined> {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name.trim();
    if (updates.username) dbUpdates.username = updates.username.toLowerCase().trim();
    if (updates.passwordHash) dbUpdates.password_hash = updates.passwordHash;
    const { data, error } = await supabase.from('users').update(dbUpdates).eq('id', userId).select().single();
    if (error) throw new Error(error.message);
    return data ? this.mapUserRow(data) : undefined;
  }

  async createPost(userId: string, content: string, mediaUrls: string[]): Promise<Post> {
    const postTags = this.extractHashtags(content);
    const { data: postData, error } = await supabase
      .from('posts')
      .insert({ user_id: userId, content: content || '', tags: postTags })
      .select()
      .single();
    if (error) throw new Error(error.message);
    const newPost = this.mapPostRow(postData);
    // Create media
    for (let i = 0; i < mediaUrls.length; i++) {
      const url = mediaUrls[i];
      const isVideo = url.endsWith('.mp4') || url.includes('video');
      await supabase.from('media').insert({
        post_id: newPost.id,
        url,
        type: isVideo ? 'video' : 'image',
        order: i
      });
    }
    // Handle hashtags
    for (const tag of postTags) {
      const { data: existing } = await supabase.from('hashtags').select('*').eq('tag', tag).maybeSingle();
      if (existing) {
        await supabase.from('hashtags').update({ post_count: (existing.post_count || 0) + 1 }).eq('id', existing.id);
      } else {
        const { data: newTag } = await supabase.from('hashtags').insert({ tag, post_count: 1 }).select().single();
        if (newTag) {
          await supabase.from('post_hashtags').insert({ post_id: newPost.id, hashtag_id: newTag.id });
        }
      }
    }
    return newPost;
  }

  async updatePost(postId: string, userId: string, content: string): Promise<Post | undefined> {
    const post = await this.getPostById(postId);
    if (!post || post.userId !== userId) return undefined;
    const oldTags = post.tags;
    const newTags = this.extractHashtags(content);
    // Decrement old hashtags
    for (const tag of oldTags) {
      const { data: existing } = await supabase.from('hashtags').select('*').eq('tag', tag).maybeSingle();
      if (existing) {
        await supabase.from('hashtags').update({ post_count: Math.max(0, (existing.post_count || 0) - 1) }).eq('id', existing.id);
      }
    }
    await supabase.from('post_hashtags').delete().eq('post_id', postId);
    // Update post
    const { data, error } = await supabase.from('posts').update({ content, tags: newTags }).eq('id', postId).select().single();
    if (error) throw new Error(error.message);
    // Increment new hashtags
    for (const tag of newTags) {
      const { data: existing } = await supabase.from('hashtags').select('*').eq('tag', tag).maybeSingle();
      if (existing) {
        await supabase.from('hashtags').update({ post_count: (existing.post_count || 0) + 1 }).eq('id', existing.id);
      } else {
        const { data: newTag } = await supabase.from('hashtags').insert({ tag, post_count: 1 }).select().single();
        if (newTag) {
          await supabase.from('post_hashtags').insert({ post_id: postId, hashtag_id: newTag.id });
        }
      }
    }
    return data ? this.mapPostRow(data) : undefined;
  }

  async deletePost(postId: string, userId: string, bypassUserCheck: boolean = false): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) return false;
    if (!bypassUserCheck && post.userId !== userId) return false;
    const { error } = await supabase.from('posts').delete().eq('id', postId);
    if (error) throw new Error(error.message);
    return true;
  }

  async toggleLike(userId: string, postId?: string, commentId?: string): Promise<{ liked: boolean; count: number }> {
    if (!postId && !commentId) throw new Error('Must provide either postId or commentId');
    const query = supabase.from('likes').select('*').eq('user_id', userId);
    if (postId) query.eq('post_id', postId);
    if (commentId) query.eq('comment_id', commentId);
    const { data: existing } = await query.maybeSingle();
    let liked: boolean;
    if (existing) {
      await supabase.from('likes').delete().eq('id', existing.id);
      liked = false;
    } else {
      const insert: any = { user_id: userId };
      if (postId) insert.post_id = postId;
      if (commentId) insert.comment_id = commentId;
      await supabase.from('likes').insert(insert);
      liked = true;
      if (postId) {
        const post = await this.getPostById(postId);
        if (post && post.userId !== userId) {
          await this.createNotification(userId, post.userId, 'like', postId);
        }
      }
    }
    let count = 0;
    if (postId) {
      const { data: allLikes } = await supabase.from('likes').select('id', { count: 'exact' }).eq('post_id', postId);
      count = allLikes?.length || 0;
      await supabase.from('posts').update({ likes_count: count }).eq('id', postId);
    }
    return { liked, count };
  }

  async createComment(userId: string, postId: string, content: string): Promise<Comment> {
    const post = await this.getPostById(postId);
    if (!post) throw new Error('Post not found');
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: userId, content }).select().single();
    if (error) throw new Error(error.message);
    const newComment = this.mapCommentRow(data);
    const { data: allComments } = await supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', postId);
    const count = allComments?.length || 0;
    await supabase.from('posts').update({ comments_count: count }).eq('id', postId);
    if (post.userId !== userId) {
      await this.createNotification(userId, post.userId, 'comment', postId, newComment.id);
    }
    return newComment;
  }

  async deleteComment(commentId: string, userId: string, bypassUserCheck: boolean = false): Promise<boolean> {
    const { data: comment } = await supabase.from('comments').select('*').eq('id', commentId).maybeSingle();
    if (!comment) return false;
    if (!bypassUserCheck && comment.user_id !== userId) return false;
    const { error } = await supabase.from('comments').delete().eq('id', commentId);
    if (error) throw new Error(error.message);
    // Update count
    const { data: allComments } = await supabase.from('comments').select('id', { count: 'exact' }).eq('post_id', comment.post_id);
    const count = allComments?.length || 0;
    await supabase.from('posts').update({ comments_count: count }).eq('id', comment.post_id);
    return true;
  }

  async toggleSavePost(userId: string, postId: string): Promise<boolean> {
    const { data: existing } = await supabase
      .from('saved_posts')
      .select('id')
      .eq('user_id', userId)
      .eq('post_id', postId)
      .maybeSingle();
    if (existing) {
      await supabase.from('saved_posts').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('saved_posts').insert({ user_id: userId, post_id: postId });
      return true;
    }
  }

  async toggleFollow(followerId: string, followingId: string): Promise<boolean> {
    if (followerId === followingId) return false;
    const { data: existing } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    if (existing) {
      await supabase.from('follows').delete().eq('id', existing.id);
      return false;
    } else {
      await supabase.from('follows').insert({ follower_id: followerId, following_id: followingId });
      await this.createNotification(followerId, followingId, 'follow');
      return true;
    }
  }

  async createStory(userId: string, mediaUrl: string, mediaType: 'image' | 'video' = 'image'): Promise<Story> {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        user_id: userId,
        media_url: mediaUrl,
        media_type: mediaType,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return this.mapStoryRow(data);
  }

  async viewStory(storyId: string, viewerId: string): Promise<StoryView | undefined> {
    const { data: story } = await supabase.from('stories').select('*').eq('id', storyId).maybeSingle();
    if (!story) return undefined;
    const { data: existing } = await supabase
      .from('story_views')
      .select('id')
      .eq('story_id', storyId)
      .eq('viewer_id', viewerId)
      .maybeSingle();
    if (existing) return this.mapStoryViewRow(existing);
    const { data, error } = await supabase.from('story_views').insert({ story_id: storyId, viewer_id: viewerId }).select().single();
    if (error) throw new Error(error.message);
    return this.mapStoryViewRow(data);
  }

  async createConversation(participantIds: string[], name?: string): Promise<Conversation> {
    const uniqueIds = Array.from(new Set(participantIds));
    if (uniqueIds.length === 2 && !name) {
      const sorted = [...uniqueIds].sort();
      const { data: existing } = await supabase
        .from('conversations')
        .select('*, conversation_participants(user_id)')
        .eq('is_group', false)
        .maybeSingle();
      if (existing) {
        const participants = existing.conversation_participants?.map((p: any) => p.user_id) || [];
        const pSorted = [...participants].sort();
        if (pSorted.length === 2 && pSorted[0] === sorted[0] && pSorted[1] === sorted[1]) {
          return this.mapConversationRow(existing);
        }
      }
    }
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({ name: name || null, is_group: uniqueIds.length > 2 || !!name })
      .select()
      .single();
    if (error) throw new Error(error.message);
    for (const uid of uniqueIds) {
      await supabase.from('conversation_participants').insert({ conversation_id: conv.id, user_id: uid });
    }
    const { data: fullConv } = await supabase.from('conversations').select('*').eq('id', conv.id).single();
    return this.mapConversationRow(fullConv);
  }

  async createMessage(conversationId: string, senderId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Promise<Message> {
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).maybeSingle();
    if (!conv) throw new Error('Conversation not found');
    const { data, error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content || '',
      media_url: mediaUrl || null,
      media_type: mediaType || null
    }).select().single();
    if (error) throw new Error(error.message);
    await supabase.from('conversations').update({
      last_message_text: mediaUrl ? 'Sent a media attachment' : content,
      last_message_at: new Date().toISOString()
    }).eq('id', conversationId);
    const { data: participants } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', conversationId);
    const pIds = (participants || []).map((p: any) => p.user_id);
    for (const pId of pIds) {
      if (pId !== senderId) {
        await this.createNotification(senderId, pId, 'message', undefined, undefined, data.id);
      }
    }
    return this.mapMessageRow(data);
  }

  async markMessagesAsSeen(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_seen: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  }

  async createNotification(senderId: string, receiverId: string, type: Notification['type'], postId?: string, commentId?: string, messageId?: string): Promise<Notification> {
    const { data, error } = await supabase.from('notifications').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      type,
      post_id: postId || null,
      comment_id: commentId || null,
      message_id: messageId || null
    }).select().single();
    if (error) throw new Error(error.message);
    return this.mapNotificationRow(data);
  }

  async markNotificationsAsRead(userId: string): Promise<void> {
    await supabase.from('notifications').update({ is_read: true }).eq('receiver_id', userId);
  }

  async createReport(reporterId: string, targetType: Report['targetType'], targetId: string, reason: string): Promise<Report> {
    const { data, error } = await supabase.from('reports').insert({
      reporter_id: reporterId,
      target_type: targetType,
      target_id: targetId,
      reason,
      status: 'pending'
    }).select().single();
    if (error) throw new Error(error.message);
    return this.mapReportRow(data);
  }

  async resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Promise<Report | undefined> {
    const { data: report } = await supabase.from('reports').select('*').eq('id', reportId).maybeSingle();
    if (!report) return undefined;
    await supabase.from('reports').update({ status }).eq('id', reportId);
    if (status === 'resolved') {
      if (report.target_type === 'post') {
        await this.deletePost(report.target_id, '', true);
      } else if (report.target_type === 'comment') {
        await this.deleteComment(report.target_id, '', true);
      } else if (report.target_type === 'user') {
        await this.deleteUser(report.target_id);
      }
    }
    const { data: updated } = await supabase.from('reports').select('*').eq('id', reportId).single();
    return this.mapReportRow(updated);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).maybeSingle();
    if (!user) return false;
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(error.message);
    return true;
  }

  async getAdminStats(): Promise<AdminStats> {
    const { count: usersCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
    const { count: postsCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
    const { count: storiesCount } = await supabase.from('stories').select('*', { count: 'exact', head: true });
    const { count: reportsCount } = await supabase.from('reports').select('*', { count: 'exact', head: true });
    const now = Date.now();
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentPosts } = await supabase.from('posts').select('user_id').gte('created_at', dayAgo);
    const { data: recentMessages } = await supabase.from('messages').select('sender_id').gte('created_at', dayAgo);
    const activeSet = new Set<string>();
    (recentPosts || []).forEach((p: any) => activeSet.add(p.user_id));
    (recentMessages || []).forEach((m: any) => activeSet.add(m.sender_id));
    const { data: admins } = await supabase.from('users').select('id').eq('role', 'admin');
    (admins || []).forEach((a: any) => activeSet.add(a.id));
    return {
      usersCount: usersCount || 0,
      postsCount: postsCount || 0,
      storiesCount: storiesCount || 0,
      reportsCount: reportsCount || 0,
      activeUsers24h: Math.max(1, activeSet.size)
    };
  }

  // =================== HELPERS ===================

  private extractHashtags(text: string): string[] {
    const tags: string[] = [];
    const regex = /#([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1].toLowerCase().trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    }
    return tags;
  }

  private mapUserRow(row: any): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      username: row.username,
      name: row.name,
      role: row.role,
      createdAt: row.created_at
    };
  }

  private mapProfileRow(row: any): Profile {
    return {
      userId: row.user_id,
      avatarUrl: row.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      coverUrl: row.cover_url || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
      bio: row.bio || '',
      website: row.website || '',
      location: row.location || '',
      isPrivate: row.is_private ?? false,
      themePreference: row.theme_preference || 'light',
      settings: row.settings ? JSON.stringify(row.settings) : undefined
    };
  }

  private mapPostRow(row: any): Post {
    return {
      id: row.id,
      userId: row.user_id,
      content: row.content || '',
      createdAt: row.created_at,
      likesCount: row.likes_count || 0,
      commentsCount: row.comments_count || 0,
      tags: row.tags || []
    };
  }

  private mapMediaRow(row: any): Media {
    return {
      id: row.id,
      postId: row.post_id,
      storyId: row.story_id,
      url: row.url,
      type: row.type,
      order: row.order || 0
    };
  }

  private mapCommentRow(row: any): Comment {
    return {
      id: row.id,
      postId: row.post_id,
      userId: row.user_id,
      content: row.content,
      createdAt: row.created_at
    };
  }

  private mapLikeRow(row: any): Like {
    return {
      id: row.id,
      userId: row.user_id,
      postId: row.post_id,
      commentId: row.comment_id,
      createdAt: row.created_at
    };
  }

  private mapFollowRow(row: any): Follow {
    return {
      id: row.id,
      followerId: row.follower_id,
      followingId: row.following_id,
      createdAt: row.created_at
    };
  }

  private mapNotificationRow(row: any): Notification {
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      type: row.type,
      postId: row.post_id,
      commentId: row.comment_id,
      messageId: row.message_id,
      isRead: row.is_read ?? false,
      createdAt: row.created_at
    };
  }

  private mapConversationRow(row: any): Conversation {
    return {
      id: row.id,
      name: row.name,
      isGroup: row.is_group ?? false,
      participants: [],
      lastMessageText: row.last_message_text || '',
      lastMessageAt: row.last_message_at
    };
  }

  private mapMessageRow(row: any): Message {
    return {
      id: row.id,
      conversationId: row.conversation_id,
      senderId: row.sender_id,
      content: row.content || '',
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      isSeen: row.is_seen ?? false,
      createdAt: row.created_at
    };
  }

  private mapStoryRow(row: any): Story {
    return {
      id: row.id,
      userId: row.user_id,
      mediaUrl: row.media_url,
      mediaType: row.media_type,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    };
  }

  private mapStoryViewRow(row: any): StoryView {
    return {
      id: row.id,
      storyId: row.story_id,
      viewerId: row.viewer_id,
      createdAt: row.created_at
    };
  }

  private mapSavedPostRow(row: any): SavedPost {
    return {
      id: row.id,
      userId: row.user_id,
      postId: row.post_id,
      createdAt: row.created_at
    };
  }

  private mapReportRow(row: any): Report {
    return {
      id: row.id,
      reporterId: row.reporter_id,
      targetType: row.target_type,
      targetId: row.target_id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at
    };
  }

  private mapHashtagRow(row: any): Hashtag {
    return {
      id: row.id,
      tag: row.tag,
      postCount: row.post_count || 0
    };
  }
}

export const db = new Database();
