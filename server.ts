/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword } from './server/db.js';
import { supabase } from './server/supabase.js';
import type {
  User, Profile, PostWithAuthor, CommentWithAuthor, ConversationWithDetails,
  MessageWithSender, StoryWithAuthor, NotificationWithDetails, UserSummary, Notification as LanternNotification
} from './src/types.js';

// Extend Express Request type to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // ==========================================================================
  // AUTHENTICATION MIDDLEWARE
  // ==========================================================================
  const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Authorization header missing.' });
      return;
    }
    const userId = authHeader.split(' ')[1];
    const user = await db.getUserById(userId);
    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session. User not found.' });
      return;
    }
    req.user = user;
    next();
  };

  const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.split(' ')[1];
      const user = await db.getUserById(userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  };

  // Helper function to build client-safe User Summary
  const getUserSummary = async (userId: string, currentUserId?: string): Promise<UserSummary> => {
    const user = await db.getUserById(userId);
    const profile = await db.getProfile(userId);
    const isFollowing = currentUserId ? await db.isFollowing(currentUserId, userId) : false;
    return {
      id: userId,
      username: user?.username || 'deleted_user',
      name: user?.name || 'Deleted User',
      avatarUrl: profile?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
      isFollowing
    };
  };

  // ==========================================================================
  // API ROUTES
  // ==========================================================================

  // --- HEALTH CHECK ---
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // --- AUTH ENDPOINTS ---
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    const { email, password, username, name } = req.body;
    if (!email || !password || !username || !name) {
      res.status(400).json({ error: 'All fields (email, password, username, name) are required.' });
      return;
    }
    if (username.length < 3 || username.includes(' ')) {
      res.status(400).json({ error: 'Username must be at least 3 characters long and contain no spaces.' });
      return;
    }
    const existingEmail = await db.getUserByEmail(email);
    if (existingEmail) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }
    const existingUsername = await db.getUserByUsername(username);
    if (existingUsername) {
      res.status(400).json({ error: 'Username is already taken.' });
      return;
    }
    const passwordHash = hashPassword(password);
    const newUser = await db.createUser(email, passwordHash, username, name);
    res.status(201).json({
      message: 'Registration successful',
      token: newUser.id,
      user: {
        id: newUser.id,
        email: newUser.email,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  });

  app.post('/api/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const user = await db.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User not found.' });
      return;
    }
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
      return;
    }
    res.json({
      message: 'Login successful',
      token: user.id,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  });

  app.get('/api/auth/me', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const profile = await db.getProfile(user.id);
    const followers = (await db.getFollowers(user.id)).length;
    const following = (await db.getFollowing(user.id)).length;
    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      profile,
      followersCount: followers,
      followingCount: following
    });
  });

  // --- POSTS ENDPOINTS ---
  app.get('/api/posts', optionalAuth, async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const { username } = req.query;
    let posts = await db.getPosts();
    if (username && typeof username === 'string') {
      const targetUser = await db.getUserByUsername(username);
      if (targetUser) {
        posts = posts.filter(p => p.userId === targetUser.id);
      } else {
        posts = [];
      }
    }
    const postsWithDetails: PostWithAuthor[] = [];
    for (const post of posts) {
      const media = await db.getPostMedia(post.id);
      const isLiked = currentUserId ? await db.isPostLiked(currentUserId, post.id) : false;
      const isSaved = currentUserId ? await db.isPostSaved(currentUserId, post.id) : false;
      postsWithDetails.push({
        ...post,
        author: await getUserSummary(post.userId, currentUserId),
        media,
        isLiked,
        isSaved
      });
    }
    res.json({ posts: postsWithDetails });
  });

  app.get('/api/posts/:postId', optionalAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const currentUserId = req.user?.id;
    const post = await db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    const media = await db.getPostMedia(post.id);
    const isLiked = currentUserId ? await db.isPostLiked(currentUserId, post.id) : false;
    const isSaved = currentUserId ? await db.isPostSaved(currentUserId, post.id) : false;
    res.json({
      post: {
        ...post,
        author: await getUserSummary(post.userId, currentUserId),
        media,
        isLiked,
        isSaved
      }
    });
  });

  app.post('/api/posts', requireAuth, async (req: Request, res: Response) => {
    const { content, mediaUrls } = req.body;
    const user = req.user!;
    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      res.status(400).json({ error: 'A post must have either text content or at least one media item.' });
      return;
    }
    const newPost = await db.createPost(user.id, content || '', mediaUrls || []);
    const postWithAuthor: PostWithAuthor = {
      ...newPost,
      author: await getUserSummary(user.id, user.id),
      media: await db.getPostMedia(newPost.id),
      isLiked: false,
      isSaved: false
    };
    res.status(201).json({ message: 'Post created successfully', post: postWithAuthor });
  });

  app.put('/api/posts/:postId', requireAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user!;
    const post = await db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    if (post.userId !== user.id) {
      res.status(403).json({ error: 'Access denied. You do not own this post.' });
      return;
    }
    const updated = await db.updatePost(postId, user.id, content || '');
    if (!updated) {
      res.status(500).json({ error: 'Failed to update post.' });
      return;
    }
    res.json({
      message: 'Post updated successfully',
      post: {
        ...updated,
        author: await getUserSummary(user.id, user.id),
        media: await db.getPostMedia(updated.id),
        isLiked: await db.isPostLiked(user.id, updated.id),
        isSaved: await db.isPostSaved(user.id, updated.id)
      }
    });
  });

  app.delete('/api/posts/:postId', requireAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;
    const post = await db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    const isAdmin = user.role?.toLowerCase() === 'admin';
    if (post.userId !== user.id && !isAdmin) {
      res.status(403).json({ error: 'Access denied. You are not authorized to delete this post.' });
      return;
    }
    const deleted = await db.deletePost(postId, user.id, isAdmin);
    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete post.' });
      return;
    }
    res.json({ message: 'Post deleted successfully' });
  });

  // --- LIKE ENDPOINT ---
  app.post('/api/posts/:postId/like', requireAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;
    try {
      const result = await db.toggleLike(user.id, postId, undefined);
      res.json({ ...result, message: result.liked ? 'Post liked' : 'Post unliked' });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- BOOKMARK SAVE ENDPOINT ---
  app.post('/api/posts/:postId/save', requireAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;
    const post = await db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    const saved = await db.toggleSavePost(user.id, postId);
    res.json({ saved, message: saved ? 'Post saved to bookmarks' : 'Post removed from bookmarks' });
  });

  // --- COMMENTS ENDPOINTS ---
  app.get('/api/posts/:postId/comments', optionalAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const currentUserId = req.user?.id;
    const comments = await db.getComments(postId);
    const commentsWithAuthor: CommentWithAuthor[] = [];
    for (const comment of comments) {
      commentsWithAuthor.push({
        ...comment,
        author: await getUserSummary(comment.userId, currentUserId)
      });
    }
    res.json({ comments: commentsWithAuthor });
  });

  app.post('/api/posts/:postId/comments', requireAuth, async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user!;
    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment body cannot be empty.' });
      return;
    }
    try {
      const newComment = await db.createComment(user.id, postId, content);
      const commentWithAuthor: CommentWithAuthor = {
        ...newComment,
        author: await getUserSummary(user.id, user.id)
      };
      res.status(201).json({ message: 'Comment added', comment: commentWithAuthor });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.delete('/api/comments/:commentId', requireAuth, async (req: Request, res: Response) => {
    const { commentId } = req.params;
    const user = req.user!;
    const isAdmin = user.role?.toLowerCase() === 'admin';
    const deleted = await db.deleteComment(commentId, user.id, isAdmin);
    if (!deleted) {
      res.status(403).json({ error: 'Could not delete comment. Verify owner privileges.' });
      return;
    }
    res.json({ message: 'Comment deleted successfully' });
  });

  // --- FOLLOW ENDPOINTS ---
  app.post('/api/users/:userId/follow', requireAuth, async (req: Request, res: Response) => {
    const { userId: followingId } = req.params;
    const user = req.user!;
    if (user.id === followingId) {
      res.status(400).json({ error: 'You cannot follow yourself.' });
      return;
    }
    const targetUser = await db.getUserById(followingId);
    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found.' });
      return;
    }
    const following = await db.toggleFollow(user.id, followingId);
    res.json({ following, message: following ? 'Followed user' : 'Unfollowed user' });
  });

  app.get('/api/users/suggested', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const allUsers = await db.getUsers();
    const suggestions = [];
    for (const u of allUsers) {
      if (u.id === user.id) continue;
      const isFollowing = await db.isFollowing(user.id, u.id);
      if (isFollowing) continue;
      suggestions.push(await getUserSummary(u.id, user.id));
    }
    res.json({ suggestions: suggestions.slice(0, 5) });
  });

  // --- PROFILE ENDPOINTS ---
  app.get('/api/profiles/:username', optionalAuth, async (req: Request, res: Response) => {
    const { username } = req.params;
    const currentUserId = req.user?.id;
    const user = await db.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }
    const profile = await db.getProfile(user.id);
    const followers = await db.getFollowers(user.id);
    const following = await db.getFollowing(user.id);
    const allPosts = await db.getPosts();
    const userPosts = allPosts.filter(p => p.userId === user.id);
    const postsWithDetails: PostWithAuthor[] = [];
    for (const post of userPosts) {
      postsWithDetails.push({
        ...post,
        author: await getUserSummary(user.id, currentUserId),
        media: await db.getPostMedia(post.id),
        isLiked: currentUserId ? await db.isPostLiked(currentUserId, post.id) : false,
        isSaved: currentUserId ? await db.isPostSaved(currentUserId, post.id) : false
      });
    }
    const isFollowing = currentUserId ? await db.isFollowing(currentUserId, user.id) : false;
    res.json({
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      profile,
      followersCount: followers.length,
      followingCount: following.length,
      isFollowing,
      posts: postsWithDetails
    });
  });

  app.get('/api/profiles/:username/bookmarks', requireAuth, async (req: Request, res: Response) => {
    const { username } = req.params;
    const user = req.user!;
    const targetUser = await db.getUserByUsername(username);
    if (!targetUser || targetUser.id !== user.id) {
      res.status(403).json({ error: 'Access denied. You can only view your own bookmarks.' });
      return;
    }
    const savedRecords = await db.getSavedPosts(user.id);
    const bookmarkedPosts: PostWithAuthor[] = [];
    for (const saved of savedRecords) {
      const post = await db.getPostById(saved.postId);
      if (!post) continue;
      bookmarkedPosts.push({
        ...post,
        author: await getUserSummary(post.userId, user.id),
        media: await db.getPostMedia(post.id),
        isLiked: await db.isPostLiked(user.id, post.id),
        isSaved: true
      });
    }
    res.json({ bookmarks: bookmarkedPosts });
  });

  app.put('/api/profiles', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const { name, username, bio, website, location, avatarUrl, coverUrl, themePreference, settings } = req.body;
    if (username && username !== user.username) {
      const existing = await db.getUserByUsername(username);
      if (existing) {
        res.status(400).json({ error: 'Username already taken.' });
        return;
      }
    }
    await db.updateUser(user.id, { name, username });
    await db.updateProfile(user.id, { bio, website, location, avatarUrl, coverUrl, themePreference, settings });
    const updatedUser = await db.getUserById(user.id);
    const updatedProfile = await db.getProfile(user.id);
    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser!.id,
        email: updatedUser!.email,
        username: updatedUser!.username,
        name: updatedUser!.name,
        role: updatedUser!.role
      },
      profile: updatedProfile
    });
  });

  app.get('/api/posts/saved', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const savedRecords = await db.getSavedPosts(user.id);
    const bookmarkedPosts: PostWithAuthor[] = [];
    for (const saved of savedRecords) {
      const post = await db.getPostById(saved.postId);
      if (!post) continue;
      bookmarkedPosts.push({
        ...post,
        author: await getUserSummary(post.userId, user.id),
        media: await db.getPostMedia(post.id),
        isLiked: await db.isPostLiked(user.id, post.id),
        isSaved: true
      });
    }
    res.json({ posts: bookmarkedPosts });
  });

  app.put('/api/users/password', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'Both current password and new password are required.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      return;
    }
    const currentHash = hashPassword(currentPassword);
    if (user.passwordHash !== currentHash) {
      res.status(401).json({ error: 'Current password is incorrect.' });
      return;
    }
    const newHash = hashPassword(newPassword);
    await db.updateUser(user.id, { passwordHash: newHash });
    res.json({ message: 'Password updated successfully' });
  });

  // --- STORIES ENDPOINTS ---
  app.get('/api/stories', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const activeStories = await db.getStories();
    const groupedMap = new Map<string, StoryWithAuthor[]>();
    for (const st of activeStories) {
      const views = await db.getStoryViews(st.id);
      const isViewed = views.some(sv => sv.viewerId === user.id);
      const viewsWithAuthors: UserSummary[] = [];
      for (const v of views) {
        viewsWithAuthors.push(await getUserSummary(v.viewerId, user.id));
      }
      const storyWithAuth: StoryWithAuthor = {
        ...st,
        author: await getUserSummary(st.userId, user.id),
        views: viewsWithAuthors,
        isViewed
      };
      const group = groupedMap.get(st.userId) || [];
      group.push(storyWithAuth);
      groupedMap.set(st.userId, group);
    }
    const groupedStories = [];
    for (const [userId, stories] of groupedMap.entries()) {
      groupedStories.push({
        author: await getUserSummary(userId, user.id),
        stories
      });
    }
    res.json({ groupedStories });
  });

  app.post('/api/stories', requireAuth, async (req: Request, res: Response) => {
    const { mediaUrl, mediaType } = req.body;
    const user = req.user!;
    if (!mediaUrl) {
      res.status(400).json({ error: 'Media URL is required to upload a story.' });
      return;
    }
    const story = await db.createStory(user.id, mediaUrl, mediaType || 'image');
    res.status(201).json({
      message: 'Story uploaded successfully',
      story: {
        ...story,
        author: await getUserSummary(user.id, user.id)
      }
    });
  });

  app.post('/api/stories/:storyId/view', requireAuth, async (req: Request, res: Response) => {
    const { storyId } = req.params;
    const user = req.user!;
    const view = await db.viewStory(storyId, user.id);
    if (!view) {
      res.status(404).json({ error: 'Story not found or expired.' });
      return;
    }
    res.json({ message: 'Story view logged' });
  });

  // --- CHAT ENDPOINTS ---
  app.get('/api/chat/conversations', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const conversations = await db.getConversations(user.id);
    const enrichedConversations: ConversationWithDetails[] = [];
    for (const c of conversations) {
      const { data: participants } = await supabase.from('conversation_participants').select('user_id').eq('conversation_id', c.id);
      const pIds = (participants || []).map((p: any) => p.user_id);
      const otherParticipantId = pIds.find((pId: string) => pId !== user.id) || user.id;
      const otherDetails = await getUserSummary(otherParticipantId, user.id);
      const displayName = c.isGroup ? (c.name || 'Group Chat') : otherDetails.name;
      const displayAvatar = c.isGroup ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=200&fit=crop' : otherDetails.avatarUrl;
      const participantsDetails = [];
      for (const pId of pIds) {
        participantsDetails.push(await getUserSummary(pId, user.id));
      }
      const allMessages = await db.getMessages(c.id);
      const unreadCount = allMessages.filter(m => m.senderId !== user.id && !m.isSeen).length;
      enrichedConversations.push({
        ...c,
        displayName,
        displayAvatar,
        participantsDetails,
        unreadCount,
        participants: pIds
      });
    }
    res.json({ conversations: enrichedConversations });
  });

  app.post('/api/chat/conversations', requireAuth, async (req: Request, res: Response) => {
    const { participantIds, name } = req.body;
    const user = req.user!;
    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      res.status(400).json({ error: 'A conversation requires at least one other participant ID.' });
      return;
    }
    const finalParticipants = Array.from(new Set([...participantIds, user.id]));
    const conv = await db.createConversation(finalParticipants, name);
    const pIds = finalParticipants;
    const otherParticipantId = pIds.find((pId: string) => pId !== user.id) || user.id;
    const otherDetails = await getUserSummary(otherParticipantId, user.id);
    const displayName = conv.isGroup ? (conv.name || 'Group Chat') : otherDetails.name;
    const displayAvatar = conv.isGroup ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=200&fit=crop' : otherDetails.avatarUrl;
    const participantsDetails = [];
    for (const pId of pIds) {
      participantsDetails.push(await getUserSummary(pId, user.id));
    }
    const convDetails: ConversationWithDetails = {
      ...conv,
      displayName,
      displayAvatar,
      participantsDetails,
      unreadCount: 0,
      participants: pIds
    };
    res.status(201).json({ conversation: convDetails });
  });

  app.get('/api/chat/conversations/:conversationId/messages', requireAuth, async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const user = req.user!;
    const conversations = await db.getConversations(user.id);
    const belongs = conversations.some(c => c.id === conversationId);
    if (!belongs) {
      res.status(403).json({ error: 'Access denied. You do not belong to this conversation thread.' });
      return;
    }
    await db.markMessagesAsSeen(conversationId, user.id);
    const messages = await db.getMessages(conversationId);
    const messagesWithSender: MessageWithSender[] = [];
    for (const msg of messages) {
      messagesWithSender.push({
        ...msg,
        sender: await getUserSummary(msg.senderId, user.id)
      });
    }
    res.json({ messages: messagesWithSender });
  });

  app.post('/api/chat/conversations/:conversationId/messages', requireAuth, async (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { content, mediaUrl, mediaType } = req.body;
    const user = req.user!;
    if (!content && !mediaUrl) {
      res.status(400).json({ error: 'A message must contain text content or a media file attachment.' });
      return;
    }
    try {
      const newMessage = await db.createMessage(conversationId, user.id, content || '', mediaUrl, mediaType);
      const messageWithSender: MessageWithSender = {
        ...newMessage,
        sender: await getUserSummary(user.id, user.id)
      };
      res.status(201).json({ message: messageWithSender });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- NOTIFICATIONS ENDPOINTS ---
  app.get('/api/notifications', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const notifications = await db.getNotifications(user.id);
    const enriched: NotificationWithDetails[] = [];
    for (const n of notifications) {
      let postContent: string | undefined = undefined;
      if (n.postId) {
        const post = await db.getPostById(n.postId);
        postContent = post?.content ? (post.content.slice(0, 40) + (post.content.length > 40 ? '...' : '')) : undefined;
      }
      enriched.push({
        ...n,
        sender: await getUserSummary(n.senderId, user.id),
        postContent
      });
    }
    res.json({ notifications: enriched });
  });

  app.post('/api/notifications/read', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    await db.markNotificationsAsRead(user.id);
    res.json({ message: 'All notifications marked as read' });
  });

  // --- EXPLORE & SEARCH ENDPOINTS ---
  app.get('/api/explore', optionalAuth, async (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const hashtags = (await db.getHashtags()).sort((a, b) => b.postCount - a.postCount).slice(0, 8);
    const posts = await db.getPosts();
    const trendingPosts: PostWithAuthor[] = [];
    for (const post of posts) {
      const media = await db.getPostMedia(post.id);
      const isLiked = currentUserId ? await db.isPostLiked(currentUserId, post.id) : false;
      const isSaved = currentUserId ? await db.isPostSaved(currentUserId, post.id) : false;
      trendingPosts.push({
        ...post,
        author: await getUserSummary(post.userId, currentUserId),
        media,
        isLiked,
        isSaved
      });
    }
    trendingPosts.sort((a, b) => b.likesCount - a.likesCount);
    res.json({ hashtags, trendingPosts: trendingPosts.slice(0, 12) });
  });

  app.get('/api/search', optionalAuth, async (req: Request, res: Response) => {
    const { q } = req.query;
    const currentUserId = req.user?.id;
    if (!q || typeof q !== 'string') {
      res.json({ users: [], posts: [], hashtags: [] });
      return;
    }
    const query = q.toLowerCase().trim();
    const allUsers = await db.getUsers();
    const users = [];
    for (const u of allUsers) {
      if (u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query)) {
        users.push(await getUserSummary(u.id, currentUserId));
      }
    }
    const allPosts = await db.getPosts();
    const posts = [];
    for (const post of allPosts) {
      if (post.content.toLowerCase().includes(query) || post.tags.some(tag => tag.toLowerCase().includes(query))) {
        const media = await db.getPostMedia(post.id);
        const isLiked = currentUserId ? await db.isPostLiked(currentUserId, post.id) : false;
        const isSaved = currentUserId ? await db.isPostSaved(currentUserId, post.id) : false;
        posts.push({
          ...post,
          author: await getUserSummary(post.userId, currentUserId),
          media,
          isLiked,
          isSaved
        });
      }
    }
    const allHashtags = await db.getHashtags();
    const hashtags = allHashtags.filter(h => h.tag.toLowerCase().includes(query));
    res.json({ users, posts, hashtags });
  });

  // --- REPORT ENDPOINT ---
  app.post('/api/reports', requireAuth, async (req: Request, res: Response) => {
    const { targetType, targetId, reason } = req.body;
    const user = req.user!;
    if (!targetType || !targetId || !reason) {
      res.status(400).json({ error: 'Target type, target ID and reason are required to file a report.' });
      return;
    }
    const report = await db.createReport(user.id, targetType, targetId, reason);
    res.status(201).json({ message: 'Thank you for reporting. Staff will investigate promptly.', report });
  });

  // --- ADMIN SYSTEM DASHBOARD ENDPOINTS ---
  app.get('/api/admin/stats', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }
    const stats = await db.getAdminStats();
    res.json({ stats });
  });

  app.get('/api/admin/reports', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }
    const reports = await db.getReports();
    reports.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const enrichedReports = [];
    for (const r of reports) {
      const reporter = await getUserSummary(r.reporterId, user.id);
      let targetDetails: any = null;
      if (r.targetType === 'post') {
        const post = await db.getPostById(r.targetId);
        targetDetails = post ? { id: post.id, content: post.content, author: await getUserSummary(post.userId, user.id) } : null;
      } else if (r.targetType === 'user') {
        targetDetails = await getUserSummary(r.targetId, user.id);
      } else if (r.targetType === 'comment') {
        const allComments = await db.getComments('');
        const comment = allComments.find(c => c.id === r.targetId);
        targetDetails = comment ? { id: comment.id, content: comment.content, author: await getUserSummary(comment.userId, user.id) } : null;
      }
      enrichedReports.push({ ...r, reporter, targetDetails });
    }
    res.json({ reports: enrichedReports });
  });

  app.post('/api/admin/reports/:reportId/resolve', requireAuth, async (req: Request, res: Response) => {
    const { reportId } = req.params;
    const { action } = req.body;
    const user = req.user!;
    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }
    if (action !== 'resolved' && action !== 'dismissed') {
      res.status(400).json({ error: 'Invalid action. Must be resolved or dismissed.' });
      return;
    }
    const report = await db.resolveReport(reportId, action);
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }
    res.json({ message: `Report successfully marked as ${action}.`, report });
  });

  // --- DEVELOPER MODE Sandbox Mock Generation Endpoints ---
  app.post('/api/admin/dev/generate-notification', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    const senders = await db.getUsers();
    const otherSenders = senders.filter(u => u.id !== user.id);
    if (otherSenders.length === 0) {
      res.status(400).json({ error: 'No other sandbox users found to act as sender.' });
      return;
    }
    const sender = otherSenders[Math.floor(Math.random() * otherSenders.length)];
    const types: LanternNotification['type'][] = ['like', 'comment', 'follow', 'mention'];
    const type = types[Math.floor(Math.random() * types.length)];
    const posts = await db.getPosts();
    const userPosts = posts.filter(p => p.userId === user.id);
    const postId = (type === 'like' || type === 'comment' || type === 'mention') && userPosts.length > 0
      ? userPosts[Math.floor(Math.random() * userPosts.length)].id
      : undefined;
    const notif = await db.createNotification(sender.id, user.id, type, postId);
    res.json({ message: 'Sandbox notification generated successfully', notification: notif });
  });

  app.post('/api/admin/dev/generate-user', requireAuth, async (req: Request, res: Response) => {
    const names = ['Chloe Pixels', 'Lucas Synth', 'Clara Captures', 'Aiden Code', 'Emma Palette', 'Julian Bloom'];
    const usernames = ['chloe.pixels', 'lucas.synth', 'clara.captures', 'aiden.code', 'emma.palette', 'julian.bloom'];
    const bios = [
      'Designing minimal generative assets for fullstack sandboxes. #Aesthetic',
      'Ambient audio wave loops & sound synthesizers. Let the sound flow.',
      'Street photography and retro film grains from Tokyo/Paris.',
      'Compiling type-safe, high-contrast systems and plugins. DRY philosophy.',
      'Generative watercolor designs and clean UI typography.',
      'Community organizer, florist, and architectural enthusiast.'
    ];
    const randIdx = Math.floor(Math.random() * usernames.length);
    const selectedUsername = usernames[randIdx] + '_' + Math.random().toString(36).substring(2, 5);
    const selectedName = names[randIdx];
    const selectedBio = bios[randIdx];
    const email = `${selectedUsername}@lantern-sandbox.io`;
    const hash = hashPassword('password123');
    const newUser = await db.createUser(email, hash, selectedUsername, selectedName);
    const profile = await db.getProfile(newUser.id);
    if (profile) {
      const locs = ['Tokyo', 'Paris', 'Berlin', 'New York', 'Iceland'];
      await db.updateProfile(newUser.id, {
        bio: selectedBio,
        location: locs[Math.floor(Math.random() * locs.length)],
        website: `${selectedUsername}.dev`,
        avatarUrl: `https://images.unsplash.com/photo-${[
          '1494790108377-be9c29b29330',
          '1535713875002-d1d0cf377fde',
          '1438761681033-6461ffad8d80',
          '1507003211169-0a1dd7228f2d',
          '1544005313-94ddf0286df2',
          '1500648767791-00dcc994a43e'
        ][randIdx]}?w=200&h=200&fit=crop`
      });
    }
    res.json({ message: 'Aesthetic creator injected into sandbox.', user: newUser });
  });

  app.post('/api/admin/dev/generate-story', requireAuth, async (req: Request, res: Response) => {
    const creators = await db.getUsers();
    if (creators.length === 0) {
      res.status(400).json({ error: 'No sandbox creators found.' });
      return;
    }
    const creator = creators[Math.floor(Math.random() * creators.length)];
    const storyImages = [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600',
      'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600',
      'https://images.unsplash.com/photo-1557683316-973673baf926?w=600'
    ];
    const randImg = storyImages[Math.floor(Math.random() * storyImages.length)];
    const story = await db.createStory(creator.id, randImg, 'image');
    res.json({ message: `Injected story for @${creator.username}`, story });
  });

  app.post('/api/admin/dev/clear-database', requireAuth, async (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Only administrators can perform full data purge.' });
      return;
    }
    // Delete all non-seed data (keep users)
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('likes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('stories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('story_views').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('saved_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('conversation_participants').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('conversations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('hashtags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('post_hashtags').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('follows').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await db.getAdminStats();
    res.json({ message: 'Sandbox database purged. Users remain.' });
  });

  // ==========================================================================
  // VITE DEV SERVER OR STATIC PRODUCTION BUILD HOSTING
  // ==========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lantern App] Server successfully started and listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
