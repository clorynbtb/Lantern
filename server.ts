/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db, hashPassword } from './server/db.js';
import {
  User,
  Profile,
  PostWithAuthor,
  CommentWithAuthor,
  ConversationWithDetails,
  MessageWithSender,
  StoryWithAuthor,
  NotificationWithDetails,
  UserSummary
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

  // JSON request body parser
  app.use(express.json());

  // ==========================================================================
  // AUTHENTICATION MIDDLEWARE
  // ==========================================================================
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Authentication required. Authorization header missing.' });
      return;
    }

    const userId = authHeader.split(' ')[1];
    const user = db.getUserById(userId);

    if (!user) {
      res.status(401).json({ error: 'Invalid or expired session. User not found.' });
      return;
    }

    req.user = user;
    next();
  };

  const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = authHeader.split(' ')[1];
      const user = db.getUserById(userId);
      if (user) {
        req.user = user;
      }
    }
    next();
  };

  // Helper function to build client-safe User Summary
  const getUserSummary = (userId: string, currentUserId?: string): UserSummary => {
    const user = db.getUserById(userId);
    const profile = db.getProfile(userId);
    const isFollowing = currentUserId ? db.isFollowing(currentUserId, userId) : false;

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
  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { email, password, username, name } = req.body;

    if (!email || !password || !username || !name) {
      res.status(400).json({ error: 'All fields (email, password, username, name) are required.' });
      return;
    }

    if (username.length < 3 || username.includes(' ')) {
      res.status(400).json({ error: 'Username must be at least 3 characters long and contain no spaces.' });
      return;
    }

    if (db.getUserByEmail(email)) {
      res.status(400).json({ error: 'An account with this email already exists.' });
      return;
    }

    if (db.getUserByUsername(username)) {
      res.status(400).json({ error: 'Username is already taken.' });
      return;
    }

    const passwordHash = hashPassword(password);
    const newUser = db.createUser(email, passwordHash, username, name);

    res.status(211).json({
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

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.getUserByEmail(email);
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

  app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const profile = db.getProfile(user.id);
    const followers = db.getFollowers(user.id).length;
    const following = db.getFollowing(user.id).length;

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
  app.get('/api/posts', optionalAuth, (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const { username } = req.query;

    let posts = db.getPosts();

    if (username && typeof username === 'string') {
      const targetUser = db.getUserByUsername(username);
      if (targetUser) {
        posts = posts.filter(p => p.userId === targetUser.id);
      } else {
        posts = [];
      }
    }

    const postsWithDetails: PostWithAuthor[] = posts.map(post => {
      const media = db.getPostMedia(post.id);
      const isLiked = currentUserId ? db.isPostLiked(currentUserId, post.id) : false;
      const isSaved = currentUserId ? db.isPostSaved(currentUserId, post.id) : false;

      return {
        ...post,
        author: getUserSummary(post.userId, currentUserId),
        media,
        isLiked,
        isSaved
      };
    });

    res.json({ posts: postsWithDetails });
  });

  app.get('/api/posts/:postId', optionalAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const currentUserId = req.user?.id;
    const post = db.getPostById(postId);

    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const media = db.getPostMedia(post.id);
    const isLiked = currentUserId ? db.isPostLiked(currentUserId, post.id) : false;
    const isSaved = currentUserId ? db.isPostSaved(currentUserId, post.id) : false;

    res.json({
      post: {
        ...post,
        author: getUserSummary(post.userId, currentUserId),
        media,
        isLiked,
        isSaved
      }
    });
  });

  app.post('/api/posts', requireAuth, (req: Request, res: Response) => {
    const { content, mediaUrls } = req.body;
    const user = req.user!;

    if (!content && (!mediaUrls || mediaUrls.length === 0)) {
      res.status(400).json({ error: 'A post must have either text content or at least one media item.' });
      return;
    }

    const newPost = db.createPost(user.id, content || '', mediaUrls || []);
    const postWithAuthor: PostWithAuthor = {
      ...newPost,
      author: getUserSummary(user.id, user.id),
      media: db.getPostMedia(newPost.id),
      isLiked: false,
      isSaved: false
    };

    res.status(201).json({ message: 'Post created successfully', post: postWithAuthor });
  });

  app.put('/api/posts/:postId', requireAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user!;

    const post = db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    if (post.userId !== user.id) {
      res.status(403).json({ error: 'Access denied. You do not own this post.' });
      return;
    }

    const updated = db.updatePost(postId, user.id, content || '');
    if (!updated) {
      res.status(500).json({ error: 'Failed to update post.' });
      return;
    }

    res.json({
      message: 'Post updated successfully',
      post: {
        ...updated,
        author: getUserSummary(user.id, user.id),
        media: db.getPostMedia(updated.id),
        isLiked: db.isPostLiked(user.id, updated.id),
        isSaved: db.isPostSaved(user.id, updated.id)
      }
    });
  });

  app.delete('/api/posts/:postId', requireAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;

    const post = db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    // Admins can bypass user check
    const isAdmin = user.role?.toLowerCase() === 'admin';
    if (post.userId !== user.id && !isAdmin) {
      res.status(403).json({ error: 'Access denied. You are not authorized to delete this post.' });
      return;
    }

    const deleted = db.deletePost(postId, user.id, isAdmin);
    if (!deleted) {
      res.status(500).json({ error: 'Failed to delete post.' });
      return;
    }

    res.json({ message: 'Post deleted successfully' });
  });

  // --- LIKE ENDPOINT ---
  app.post('/api/posts/:postId/like', requireAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;

    try {
      const result = db.toggleLike(user.id, postId, undefined);
      res.json({ ...result, message: result.liked ? 'Post liked' : 'Post unliked' });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- BOOKMARK SAVE ENDPOINT ---
  app.post('/api/posts/:postId/save', requireAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const user = req.user!;

    const post = db.getPostById(postId);
    if (!post) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }

    const saved = db.toggleSavePost(user.id, postId);
    res.json({ saved, message: saved ? 'Post saved to bookmarks' : 'Post removed from bookmarks' });
  });

  // --- COMMENTS ENDPOINTS ---
  app.get('/api/posts/:postId/comments', optionalAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const currentUserId = req.user?.id;

    const comments = db.getComments(postId);
    const commentsWithAuthor: CommentWithAuthor[] = comments.map(comment => ({
      ...comment,
      author: getUserSummary(comment.userId, currentUserId)
    }));

    res.json({ comments: commentsWithAuthor });
  });

  app.post('/api/posts/:postId/comments', requireAuth, (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;
    const user = req.user!;

    if (!content || content.trim().length === 0) {
      res.status(400).json({ error: 'Comment body cannot be empty.' });
      return;
    }

    try {
      const newComment = db.createComment(user.id, postId, content);
      const commentWithAuthor: CommentWithAuthor = {
        ...newComment,
        author: getUserSummary(user.id, user.id)
      };

      res.status(201).json({ message: 'Comment added', comment: commentWithAuthor });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.delete('/api/comments/:commentId', requireAuth, (req: Request, res: Response) => {
    const { commentId } = req.params;
    const user = req.user!;

    const isAdmin = user.role?.toLowerCase() === 'admin';
    const deleted = db.deleteComment(commentId, user.id, isAdmin);

    if (!deleted) {
      res.status(403).json({ error: 'Could not delete comment. Verify owner privileges.' });
      return;
    }

    res.json({ message: 'Comment deleted successfully' });
  });

  // --- FOLLOW ENDPOINTS ---
  app.post('/api/users/:userId/follow', requireAuth, (req: Request, res: Response) => {
    const { userId: followingId } = req.params;
    const user = req.user!;

    if (user.id === followingId) {
      res.status(400).json({ error: 'You cannot follow yourself.' });
      return;
    }

    const targetUser = db.getUserById(followingId);
    if (!targetUser) {
      res.status(404).json({ error: 'Target user not found.' });
      return;
    }

    const following = db.toggleFollow(user.id, followingId);
    res.json({ following, message: following ? 'Followed user' : 'Unfollowed user' });
  });

  app.get('/api/users/suggested', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const allUsers = db.getUsers();

    // Exclude self and already followed users
    const suggestions = allUsers
      .filter(u => u.id !== user.id && !db.isFollowing(user.id, u.id))
      .map(u => getUserSummary(u.id, user.id))
      .slice(0, 5); // top 5 suggestions

    res.json({ suggestions });
  });

  // --- PROFILE ENDPOINTS ---
  app.get(['/api/profiles/:username', '/api/users/:username/profile'], optionalAuth, (req: Request, res: Response) => {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = db.getUserByUsername(username);
    if (!user) {
      res.status(404).json({ error: 'Profile not found.' });
      return;
    }

    const profile = db.getProfile(user.id);
    const followers = db.getFollowers(user.id);
    const following = db.getFollowing(user.id);
    const posts = db.getPosts().filter(p => p.userId === user.id);

    // Map posts with full media details
    const postsWithDetails: PostWithAuthor[] = posts.map(post => ({
      ...post,
      author: getUserSummary(user.id, currentUserId),
      media: db.getPostMedia(post.id),
      isLiked: currentUserId ? db.isPostLiked(currentUserId, post.id) : false,
      isSaved: currentUserId ? db.isPostSaved(currentUserId, post.id) : false
    }));

    const isFollowing = currentUserId ? db.isFollowing(currentUserId, user.id) : false;

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

  app.get('/api/profiles/:username/bookmarks', requireAuth, (req: Request, res: Response) => {
    const { username } = req.params;
    const user = req.user!;

    const targetUser = db.getUserByUsername(username);
    if (!targetUser || targetUser.id !== user.id) {
      res.status(403).json({ error: 'Access denied. You can only view your own bookmarks.' });
      return;
    }

    const savedRecords = db.getSavedPosts(user.id);
    const bookmarkedPosts: PostWithAuthor[] = savedRecords
      .map(saved => {
        const post = db.getPostById(saved.postId);
        if (!post) return null;

        return {
          ...post,
          author: getUserSummary(post.userId, user.id),
          media: db.getPostMedia(post.id),
          isLiked: db.isPostLiked(user.id, post.id),
          isSaved: true
        };
      })
      .filter(p => p !== null) as PostWithAuthor[];

    res.json({ bookmarks: bookmarkedPosts });
  });

  app.put(['/api/profiles', '/api/users/profile'], requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const { name, username, bio, website, location, avatarUrl, coverUrl, themePreference, settings } = req.body;

    if (username && username !== user.username) {
      const existing = db.getUserByUsername(username);
      if (existing) {
        res.status(400).json({ error: 'Username already taken.' });
        return;
      }
    }

    // Update User details
    db.updateUser(user.id, { name, username });

    // Update Profile details
    db.updateProfile(user.id, { bio, website, location, avatarUrl, coverUrl, themePreference, settings });

    const updatedUser = db.getUserById(user.id)!;
    const updatedProfile = db.getProfile(user.id)!;

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
        role: updatedUser.role
      },
      profile: updatedProfile
    });
  });

  app.get('/api/posts/saved', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const savedRecords = db.getSavedPosts(user.id);
    const bookmarkedPosts: PostWithAuthor[] = savedRecords
      .map(saved => {
        const post = db.getPostById(saved.postId);
        if (!post) return null;

        return {
          ...post,
          author: getUserSummary(post.userId, user.id),
          media: db.getPostMedia(post.id),
          isLiked: db.isPostLiked(user.id, post.id),
          isSaved: true
        };
      })
      .filter(p => p !== null) as PostWithAuthor[];

    res.json({ posts: bookmarkedPosts });
  });

  app.put('/api/users/password', requireAuth, (req: Request, res: Response) => {
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
    db.updateUser(user.id, { passwordHash: newHash });

    res.json({ message: 'Password updated successfully' });
  });

  // --- STORIES ENDPOINTS ---
  app.get('/api/stories', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const activeStories = db.getStories();

    // Group stories by creator for Instagram-like slider bubble
    const groupedMap = new Map<string, StoryWithAuthor[]>();

    activeStories.forEach(st => {
      const storyAuthor = getUserSummary(st.userId, user.id);
      const views = db.getStoryViews(st.id).map(sv => getUserSummary(sv.viewerId, user.id));
      const isViewed = db.getStoryViews(st.id).some(sv => sv.viewerId === user.id);

      const storyWithAuth: StoryWithAuthor = {
        ...st,
        author: storyAuthor,
        views,
        isViewed
      };

      const group = groupedMap.get(st.userId) || [];
      group.push(storyWithAuth);
      groupedMap.set(st.userId, group);
    });

    const groupedStories = Array.from(groupedMap.entries()).map(([userId, stories]) => ({
      author: getUserSummary(userId, user.id),
      stories
    }));

    res.json({ groupedStories });
  });

  app.post('/api/stories', requireAuth, (req: Request, res: Response) => {
    const { mediaUrl, mediaType } = req.body;
    const user = req.user!;

    if (!mediaUrl) {
      res.status(400).json({ error: 'Media URL is required to upload a story.' });
      return;
    }

    const story = db.createStory(user.id, mediaUrl, mediaType || 'image');
    res.status(201).json({
      message: 'Story uploaded successfully',
      story: {
        ...story,
        author: getUserSummary(user.id, user.id)
      }
    });
  });

  app.post('/api/stories/:storyId/view', requireAuth, (req: Request, res: Response) => {
    const { storyId } = req.params;
    const user = req.user!;

    const view = db.viewStory(storyId, user.id);
    if (!view) {
      res.status(404).json({ error: 'Story not found or expired.' });
      return;
    }

    res.json({ message: 'Story view logged' });
  });

  // --- CHAT ENDPOINTS ---
  app.get('/api/chat/conversations', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const conversations = db.getConversations(user.id);

    const enrichedConversations: ConversationWithDetails[] = conversations.map(c => {
      // Find other participant for DM displays
      const otherParticipantId = c.participants.find(pId => pId !== user.id) || user.id;
      const otherDetails = getUserSummary(otherParticipantId, user.id);

      const displayName = c.isGroup ? (c.name || 'Group Chat') : otherDetails.name;
      const displayAvatar = c.isGroup ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=200&fit=crop' : otherDetails.avatarUrl;

      const participantsDetails = c.participants.map(pId => getUserSummary(pId, user.id));
      const unreadCount = db.getMessages(c.id).filter(m => m.senderId !== user.id && !m.isSeen).length;

      return {
        ...c,
        displayName,
        displayAvatar,
        participantsDetails,
        unreadCount
      };
    });

    res.json({ conversations: enrichedConversations });
  });

  app.post('/api/chat/conversations', requireAuth, (req: Request, res: Response) => {
    const { participantIds, name } = req.body;
    const user = req.user!;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      res.status(400).json({ error: 'A conversation requires at least one other participant ID.' });
      return;
    }

    // Ensure current user is in the participants list
    const finalParticipants = Array.from(new Set([...participantIds, user.id]));

    const conv = db.createConversation(finalParticipants, name);

    const otherParticipantId = conv.participants.find(pId => pId !== user.id) || user.id;
    const otherDetails = getUserSummary(otherParticipantId, user.id);

    const displayName = conv.isGroup ? (conv.name || 'Group Chat') : otherDetails.name;
    const displayAvatar = conv.isGroup ? 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=200&fit=crop' : otherDetails.avatarUrl;

    const convDetails: ConversationWithDetails = {
      ...conv,
      displayName,
      displayAvatar,
      participantsDetails: conv.participants.map(pId => getUserSummary(pId, user.id)),
      unreadCount: 0
    };

    res.status(201).json({ conversation: convDetails });
  });

  app.get('/api/chat/conversations/:conversationId/messages', requireAuth, (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const user = req.user!;

    // Validate membership
    const conversations = db.getConversations(user.id);
    const belongs = conversations.some(c => c.id === conversationId);
    if (!belongs) {
      res.status(403).json({ error: 'Access denied. You do not belong to this conversation thread.' });
      return;
    }

    // Auto-mark messages as seen on opening conversation log
    db.markMessagesAsSeen(conversationId, user.id);

    const messages = db.getMessages(conversationId);
    const messagesWithSender: MessageWithSender[] = messages.map(msg => ({
      ...msg,
      sender: getUserSummary(msg.senderId, user.id)
    }));

    res.json({ messages: messagesWithSender });
  });

  app.post('/api/chat/conversations/:conversationId/messages', requireAuth, (req: Request, res: Response) => {
    const { conversationId } = req.params;
    const { content, mediaUrl, mediaType } = req.body;
    const user = req.user!;

    if (!content && !mediaUrl) {
      res.status(400).json({ error: 'A message must contain text content or a media file attachment.' });
      return;
    }

    try {
      const newMessage = db.createMessage(conversationId, user.id, content || '', mediaUrl, mediaType);
      const messageWithSender: MessageWithSender = {
        ...newMessage,
        sender: getUserSummary(user.id, user.id)
      };

      res.status(201).json({ message: messageWithSender });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- NOTIFICATIONS ENDPOINTS ---
  app.get('/api/notifications', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const notifications = db.getNotifications(user.id);

    const enriched: NotificationWithDetails[] = notifications.map(n => {
      let postContent: string | undefined = undefined;
      if (n.postId) {
        const post = db.getPostById(n.postId);
        postContent = post?.content ? (post.content.slice(0, 40) + (post.content.length > 40 ? '...' : '')) : undefined;
      }

      return {
        ...n,
        sender: getUserSummary(n.senderId, user.id),
        postContent
      };
    });

    res.json({ notifications: enriched });
  });

  app.post('/api/notifications/read', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    db.markNotificationsAsRead(user.id);
    res.json({ message: 'All notifications marked as read' });
  });

  // --- EXPLORE & SEARCH ENDPOINTS ---
  app.get('/api/explore', optionalAuth, (req: Request, res: Response) => {
    const currentUserId = req.user?.id;
    const hashtags = db.getHashtags().sort((a, b) => b.postCount - a.postCount).slice(0, 8);
    const posts = db.getPosts();

    // Map popular creator recommendations
    const trendingPosts: PostWithAuthor[] = posts
      .map(post => {
        const media = db.getPostMedia(post.id);
        const isLiked = currentUserId ? db.isPostLiked(currentUserId, post.id) : false;
        const isSaved = currentUserId ? db.isPostSaved(currentUserId, post.id) : false;

        return {
          ...post,
          author: getUserSummary(post.userId, currentUserId),
          media,
          isLiked,
          isSaved
        };
      })
      .sort((a, b) => b.likesCount - a.likesCount) // sort by popularity
      .slice(0, 12);

    res.json({ hashtags, trendingPosts });
  });

  app.get('/api/search', optionalAuth, (req: Request, res: Response) => {
    const { q } = req.query;
    const currentUserId = req.user?.id;

    if (!q || typeof q !== 'string') {
      res.json({ users: [], posts: [], hashtags: [] });
      return;
    }

    const query = q.toLowerCase().trim();

    // 1. Search Users
    const users = db.getUsers()
      .filter(u => u.username.toLowerCase().includes(query) || u.name.toLowerCase().includes(query))
      .map(u => getUserSummary(u.id, currentUserId));

    // 2. Search Posts (including hashtag checks)
    const posts = db.getPosts()
      .filter(p => p.content.toLowerCase().includes(query) || p.tags.some(tag => tag.toLowerCase().includes(query)))
      .map(post => {
        const media = db.getPostMedia(post.id);
        const isLiked = currentUserId ? db.isPostLiked(currentUserId, post.id) : false;
        const isSaved = currentUserId ? db.isPostSaved(currentUserId, post.id) : false;

        return {
          ...post,
          author: getUserSummary(post.userId, currentUserId),
          media,
          isLiked,
          isSaved
        };
      });

    // 3. Search Hashtags
    const hashtags = db.getHashtags()
      .filter(h => h.tag.toLowerCase().includes(query));

    res.json({ users, posts, hashtags });
  });

  // --- REPORT ENDPOINT ---
  app.post('/api/reports', requireAuth, (req: Request, res: Response) => {
    const { targetType, targetId, reason } = req.body;
    const user = req.user!;

    if (!targetType || !targetId || !reason) {
      res.status(400).json({ error: 'Target type, target ID and reason are required to file a report.' });
      return;
    }

    const report = db.createReport(user.id, targetType, targetId, reason);
    res.status(201).json({ message: 'Thank you for reporting. Staff will investigate promptly.', report });
  });

  // --- ADMIN SYSTEM DASHBOARD ENDPOINTS ---
  app.get('/api/admin/stats', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }

    const stats = db.getAdminStats();
    res.json({ stats });
  });

  app.get('/api/admin/reports', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }

    const reports = db.getReports().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const enrichedReports = reports.map(r => {
      const reporter = getUserSummary(r.reporterId, user.id);

      let targetDetails: any = null;
      if (r.targetType === 'post') {
        const post = db.getPostById(r.targetId);
        targetDetails = post ? { id: post.id, content: post.content, author: getUserSummary(post.userId, user.id) } : null;
      } else if (r.targetType === 'user') {
        targetDetails = getUserSummary(r.targetId, user.id);
      } else if (r.targetType === 'comment') {
        const comments = db.getComments(''); // fetch all comments? we can fallback to lookup
        const comment = db.schema.comments.find(c => c.id === r.targetId);
        targetDetails = comment ? { id: comment.id, content: comment.content, author: getUserSummary(comment.userId, user.id) } : null;
      }

      return {
        ...r,
        reporter,
        targetDetails
      };
    });

    res.json({ reports: enrichedReports });
  });

  app.post('/api/admin/reports/:reportId/resolve', requireAuth, (req: Request, res: Response) => {
    const { reportId } = req.params;
    const { action } = req.body; // 'resolved' (ban/delete) or 'dismissed' (forgive)
    const user = req.user!;

    if (user.role?.toLowerCase() !== 'admin') {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
      return;
    }

    if (action !== 'resolved' && action !== 'dismissed') {
      res.status(400).json({ error: 'Invalid action. Must be resolved or dismissed.' });
      return;
    }

    const report = db.resolveReport(reportId, action);
    if (!report) {
      res.status(404).json({ error: 'Report not found.' });
      return;
    }

    res.json({ message: `Report successfully marked as ${action}.`, report });
  });

  // --- DEVELOPER MODE Sandbox Mock Generation Endpoints ---
  app.post('/api/admin/dev/generate-notification', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    const senders = db.getUsers().filter(u => u.id !== user.id);
    if (senders.length === 0) {
      res.status(400).json({ error: 'No other sandbox users found to act as sender.' });
      return;
    }
    
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const types: ('like' | 'comment' | 'follow' | 'mention')[] = ['like', 'comment', 'follow', 'mention'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    // Pick a random post if needed
    const posts = db.getPosts().filter(p => p.userId === user.id);
    const postId = (type === 'like' || type === 'comment' || type === 'mention') && posts.length > 0 
      ? posts[Math.floor(Math.random() * posts.length)].id 
      : undefined;

    const notif = db.createNotification(sender.id, user.id, type, postId);
    res.json({ message: 'Sandbox notification generated successfully', notification: notif });
  });

  app.post('/api/admin/dev/generate-user', requireAuth, (req: Request, res: Response) => {
    const names = [
      'Chloe Pixels', 'Lucas Synth', 'Clara Captures', 'Aiden Code', 'Emma Palette', 'Julian Bloom'
    ];
    const usernames = [
      'chloe.pixels', 'lucas.synth', 'clara.captures', 'aiden.code', 'emma.palette', 'julian.bloom'
    ];
    const bios = [
      'Designing minimal generative assets for fullstack sandboxes. #Aesthetic',
      'Ambient audio wave loops & sound synthesizers. Let the sound flow.',
      'Street photography and retro film grains from Tokyo/Paris. 📸',
      'Compiling type-safe, high-contrast systems and plugins. DRY philosophy.',
      'Generative watercolor designs and clean UI typography.',
      'Community organizer, florist, and architectural enthusiast. 🌸'
    ];
    
    const randIdx = Math.floor(Math.random() * usernames.length);
    const selectedUsername = usernames[randIdx] + '_' + Math.random().toString(36).substring(2, 5);
    const selectedName = names[randIdx];
    const selectedBio = bios[randIdx];
    const email = `${selectedUsername}@lantern-sandbox.io`;
    
    const hash = hashPassword('password123');
    const newUser = db.createUser(email, hash, selectedUsername, selectedName);
    
    // Enrich with a customized profile
    const profile = db.getProfile(newUser.id);
    if (profile) {
      profile.bio = selectedBio;
      profile.location = ['Tokyo', 'Paris', 'Berlin', 'New York', 'Iceland'][Math.floor(Math.random() * 5)];
      profile.website = `${selectedUsername}.dev`;
      profile.avatarUrl = `https://images.unsplash.com/photo-${[
        '1494790108377-be9c29b29330',
        '1535713875002-d1d0cf377fde',
        '1438761681033-6461ffad8d80',
        '1507003211169-0a1dd7228f2d',
        '1544005313-94ddf0286df2',
        '1500648767791-00dcc994a43e'
      ][randIdx]}?w=200&h=200&fit=crop`;
      db.updateProfile(newUser.id, profile);
    }
    
    res.json({ message: 'Aesthetic creator injected into sandbox.', user: newUser });
  });

  app.post('/api/admin/dev/generate-story', requireAuth, (req: Request, res: Response) => {
    const creators = db.getUsers();
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
    
    const story = db.createStory(creator.id, randImg, 'image');
    res.json({ message: `Injected story for @${creator.username}`, story });
  });

  app.post('/api/admin/dev/clear-database', requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Only administrators can perform full data purge.' });
      return;
    }
    
    // Clear everything except original seed data or the active admin user
    db.schema.posts = [];
    db.schema.media = [];
    db.schema.comments = [];
    db.schema.likes = [];
    db.schema.notifications = [];
    db.schema.messages = [];
    db.schema.stories = [];
    db.schema.storyViews = [];
    db.schema.savedPosts = [];
    db.schema.reports = [];
    // Reset user statistics
    db.getAdminStats();
    
    res.json({ message: 'Sandbox database purged. Only seed creators and admins remain.' });
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
