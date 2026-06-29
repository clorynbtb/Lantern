/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  User,
  Profile,
  Post,
  Media,
  Comment,
  Like,
  Follow,
  Notification,
  Conversation,
  Message,
  Story,
  StoryView,
  SavedPost,
  Report,
  Hashtag,
  PostHashtag,
  AdminStats
} from '../src/types.js';

// Setup node.js crypto utility for password hashing and random IDs
import cryptoNode from 'crypto';

function hashPassword(password: string): string {
  return cryptoNode.createHash('sha256').update(password + '_lantern_salt').digest('hex');
}

function generateId(): string {
  return cryptoNode.randomBytes(8).toString('hex');
}

// Ensure the data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'lantern.db.json');

interface DatabaseSchema {
  users: User[];
  profiles: Profile[];
  posts: Post[];
  media: Media[];
  comments: Comment[];
  likes: Like[];
  follows: Follow[];
  notifications: Notification[];
  conversations: Conversation[];
  messages: Message[];
  stories: Story[];
  storyViews: StoryView[];
  savedPosts: SavedPost[];
  reports: Report[];
  hashtags: Hashtag[];
  postHashtags: PostHashtag[];
}

const emptySchema = (): DatabaseSchema => ({
  users: [],
  profiles: [],
  posts: [],
  media: [],
  comments: [],
  likes: [],
  follows: [],
  notifications: [],
  conversations: [],
  messages: [],
  stories: [],
  storyViews: [],
  savedPosts: [],
  reports: [],
  hashtags: [],
  postHashtags: []
});

class Database {
  public schema: DatabaseSchema = emptySchema();

  constructor() {
    this.init();
  }

  private init() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        this.schema = JSON.parse(fileContent);
      } catch (err) {
        console.error('Failed to parse database file, starting clean', err);
        this.schema = emptySchema();
        this.save();
      }
    } else {
      this.schema = emptySchema();
      this.seed();
      this.save();
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.schema, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database to disk', err);
    }
  }

  private seed() {
    // Generate high-fidelity initial users & creators
    const usersData = [
      { id: 'u_admin', email: 'admin@lantern.com', name: 'Lantern Staff', username: 'lantern', role: 'admin' as const },
      { id: 'u_sophia', email: 'sophia@example.com', name: 'Sophia Sterling', username: 'sophia.sterling', role: 'user' as const },
      { id: 'u_marcus', email: 'marcus@example.com', name: 'Marcus Chen', username: 'marcus.designs', role: 'user' as const },
      { id: 'u_elena', email: 'elena@example.com', name: 'Elena Rostova', username: 'elena.wanderlust', role: 'user' as const },
      { id: 'u_liam', email: 'liam@example.com', name: 'Liam Sterling', username: 'liam.creates', role: 'user' as const }
    ];

    const passwordHash = hashPassword('password123');

    this.schema.users = usersData.map(u => ({
      id: u.id,
      email: u.email,
      passwordHash,
      username: u.username,
      name: u.name,
      role: u.role,
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
    }));

    // Profiles
    this.schema.profiles = [
      {
        userId: 'u_admin',
        avatarUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=200&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
        bio: 'Official Lantern community manager and platform updates channel. Welcome to our secure, modern space. #LanternSocial',
        website: 'lantern.com',
        location: 'San Francisco, CA',
        isPrivate: false,
        themePreference: 'light'
      },
      {
        userId: 'u_sophia',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=400&fit=crop',
        bio: 'Portrait Photographer & Product Designer. Capturing geometry in raw emotions. ✨ Let\'s collaborate!',
        website: 'sophiasterling.studio',
        location: 'New York, NY',
        isPrivate: false,
        themePreference: 'light'
      },
      {
        userId: 'u_marcus',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=400&fit=crop',
        bio: 'Minimalist Architect & UI/UX Director. Designing objects that stand the test of physical and digital time. #minimalism #design',
        website: 'chen-minimalist.io',
        location: 'Tokyo, JP',
        isPrivate: false,
        themePreference: 'dark'
      },
      {
        userId: 'u_elena',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&h=400&fit=crop',
        bio: 'Explorer of remote corners. Documenting cultures, mountains, and culinary wonders. 🧭 Always on the move.',
        website: 'elena-travels.com',
        location: 'Rome, IT',
        isPrivate: false,
        themePreference: 'light'
      },
      {
        userId: 'u_liam',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
        coverUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&h=400&fit=crop',
        bio: 'Visual Creator, Film director and Indie developer. Building immersive interactive layouts.',
        website: 'liamcreates.co',
        location: 'London, UK',
        isPrivate: false,
        themePreference: 'light'
      }
    ];

    // Follow relationships (Everyone follows admin and each other)
    const follows = [
      { followerId: 'u_sophia', followingId: 'u_marcus' },
      { followerId: 'u_sophia', followingId: 'u_elena' },
      { followerId: 'u_sophia', followingId: 'u_admin' },
      { followerId: 'u_marcus', followingId: 'u_sophia' },
      { followerId: 'u_marcus', followingId: 'u_admin' },
      { followerId: 'u_elena', followingId: 'u_sophia' },
      { followerId: 'u_elena', followingId: 'u_marcus' },
      { followerId: 'u_liam', followingId: 'u_sophia' },
      { followerId: 'u_liam', followingId: 'u_marcus' },
      { followerId: 'u_liam', followingId: 'u_elena' }
    ];

    this.schema.follows = follows.map((f, i) => ({
      id: `f_${i}`,
      ...f,
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Seed Posts
    const postsData = [
      {
        id: 'p_1',
        userId: 'u_sophia',
        content: 'Golden Hour in New York. There is a specific angle where the city looks entirely painted in warm gold and glowing copper. Shot on 35mm. #goldenhour #photography #nyc',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        likesCount: 3,
        commentsCount: 2,
        tags: ['goldenhour', 'photography', 'nyc'],
        media: [
          { id: 'm_p1_1', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&fit=crop', type: 'image' as const, order: 0 }
        ]
      },
      {
        id: 'p_2',
        userId: 'u_marcus',
        content: 'Completed the pavilion design project for the Tokyo Arch Expo. Stretched canvas interfaces met structural cedar wood beams. #minimalism #architecture #tokyo',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        likesCount: 2,
        commentsCount: 1,
        tags: ['minimalism', 'architecture', 'tokyo'],
        media: [
          { id: 'm_p2_1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&fit=crop', type: 'image' as const, order: 0 },
          { id: 'm_p2_2', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&fit=crop', type: 'image' as const, order: 1 }
        ]
      },
      {
        id: 'p_3',
        userId: 'u_elena',
        content: 'Waking up to the mist rolling over the Italian Dolomites. No signal, no noise, just the sound of mountain air. 🏔️🇮🇹 #dolomites #travel #mountains',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        likesCount: 4,
        commentsCount: 2,
        tags: ['dolomites', 'travel', 'mountains'],
        media: [
          { id: 'm_p3_1', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&fit=crop', type: 'image' as const, order: 0 }
        ]
      }
    ];

    this.schema.posts = postsData.map(p => ({
      id: p.id,
      userId: p.userId,
      content: p.content,
      createdAt: p.createdAt,
      likesCount: p.likesCount,
      commentsCount: p.commentsCount,
      tags: p.tags
    }));

    // Post media
    this.schema.media = postsData.flatMap(p => p.media.map(m => ({ ...m, postId: p.id })));

    // Likes
    this.schema.likes = [
      { id: 'l_1', userId: 'u_marcus', postId: 'p_1', createdAt: new Date().toISOString() },
      { id: 'l_2', userId: 'u_elena', postId: 'p_1', createdAt: new Date().toISOString() },
      { id: 'l_3', userId: 'u_liam', postId: 'p_1', createdAt: new Date().toISOString() },
      { id: 'l_4', userId: 'u_sophia', postId: 'p_2', createdAt: new Date().toISOString() },
      { id: 'l_5', userId: 'u_liam', postId: 'p_2', createdAt: new Date().toISOString() },
      { id: 'l_6', userId: 'u_sophia', postId: 'p_3', createdAt: new Date().toISOString() },
      { id: 'l_7', userId: 'u_marcus', postId: 'p_3', createdAt: new Date().toISOString() },
      { id: 'l_8', userId: 'u_liam', postId: 'p_3', createdAt: new Date().toISOString() },
      { id: 'l_9', userId: 'u_admin', postId: 'p_3', createdAt: new Date().toISOString() }
    ];

    // Comments
    this.schema.comments = [
      { id: 'c_1', postId: 'p_1', userId: 'u_marcus', content: 'These colors are incredible Sophia. 35mm dynamic range hits different!', createdAt: new Date(Date.now() - 2.8 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'c_2', postId: 'p_1', userId: 'u_elena', content: 'Makes me want to visit NY next month. Perfect timing!', createdAt: new Date(Date.now() - 2.5 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'c_3', postId: 'p_2', userId: 'u_sophia', content: 'The wood textures are beautiful. Minimalist perfection.', createdAt: new Date(Date.now() - 1.8 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'c_4', postId: 'p_3', userId: 'u_liam', content: 'Absolutely breathtaking Elena! Take me next time.', createdAt: new Date(Date.now() - 0.9 * 24 * 60 * 60 * 1000).toISOString() },
      { id: 'c_5', postId: 'p_3', userId: 'u_sophia', content: 'That mist frame is perfect.', createdAt: new Date(Date.now() - 0.5 * 24 * 60 * 60 * 1000).toISOString() }
    ];

    // Conversations & Messages
    this.schema.conversations = [
      {
        id: 'conv_1',
        isGroup: false,
        participants: ['u_sophia', 'u_marcus'],
        lastMessageText: 'The project details look great. Talk tomorrow!',
        lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ];

    this.schema.messages = [
      { id: 'msg_1', conversationId: 'conv_1', senderId: 'u_sophia', content: 'Hey Marcus, did you see the design specs I uploaded?', isSeen: true, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
      { id: 'msg_2', conversationId: 'conv_1', senderId: 'u_marcus', content: 'Yes, just reviewed them. Love the spatial layout.', isSeen: true, createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString() },
      { id: 'msg_3', conversationId: 'conv_1', senderId: 'u_sophia', content: 'The project details look great. Talk tomorrow!', isSeen: false, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() }
    ];

    // Stories (Sophia uploaded a story)
    this.schema.stories = [
      {
        id: 'st_1',
        userId: 'u_sophia',
        mediaUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=1000&fit=crop',
        mediaType: 'image',
        expiresAt: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(), // expires in 18 hrs
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'st_2',
        userId: 'u_marcus',
        mediaUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=1000&fit=crop',
        mediaType: 'image',
        expiresAt: new Date(Date.now() + 20 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      }
    ];

    // StoryViews
    this.schema.storyViews = [
      { id: 'stv_1', storyId: 'st_1', viewerId: 'u_marcus', createdAt: new Date().toISOString() },
      { id: 'stv_2', storyId: 'st_1', viewerId: 'u_elena', createdAt: new Date().toISOString() }
    ];

    // SavedPosts
    this.schema.savedPosts = [
      { id: 'sp_1', userId: 'u_sophia', postId: 'p_2', createdAt: new Date().toISOString() },
      { id: 'sp_2', userId: 'u_marcus', postId: 'p_3', createdAt: new Date().toISOString() }
    ];

    // Hashtags
    this.schema.hashtags = [
      { id: 'h_1', tag: 'photography', postCount: 1 },
      { id: 'h_2', tag: 'nyc', postCount: 1 },
      { id: 'h_3', tag: 'minimalism', postCount: 1 },
      { id: 'h_4', tag: 'architecture', postCount: 1 },
      { id: 'h_5', tag: 'tokyo', postCount: 1 },
      { id: 'h_6', tag: 'dolomites', postCount: 1 },
      { id: 'h_7', tag: 'travel', postCount: 1 },
      { id: 'h_8', tag: 'mountains', postCount: 1 },
      { id: 'h_9', tag: 'goldenhour', postCount: 1 }
    ];

    this.schema.postHashtags = [
      { id: 'ph_1', postId: 'p_1', hashtagId: 'h_9' },
      { id: 'ph_2', postId: 'p_1', hashtagId: 'h_1' },
      { id: 'ph_3', postId: 'p_1', hashtagId: 'h_2' },
      { id: 'ph_4', postId: 'p_2', hashtagId: 'h_3' },
      { id: 'ph_5', postId: 'p_2', hashtagId: 'h_4' },
      { id: 'ph_6', postId: 'p_2', hashtagId: 'h_5' },
      { id: 'ph_7', postId: 'p_3', hashtagId: 'h_6' },
      { id: 'ph_8', postId: 'p_3', hashtagId: 'h_7' },
      { id: 'ph_9', postId: 'p_3', hashtagId: 'h_8' }
    ];

    // Notification
    this.schema.notifications = [
      { id: 'nt_1', senderId: 'u_marcus', receiverId: 'u_sophia', type: 'like', postId: 'p_1', isRead: false, createdAt: new Date().toISOString() },
      { id: 'nt_2', senderId: 'u_marcus', receiverId: 'u_sophia', type: 'comment', postId: 'p_1', commentId: 'c_1', isRead: false, createdAt: new Date().toISOString() }
    ];
  }

  // ==========================================================================
  // READ METHODS
  // ==========================================================================

  getUsers(): User[] {
    return this.schema.users;
  }

  getUserById(id: string): User | undefined {
    return this.schema.users.find(u => u.id === id);
  }

  getUserByUsername(username: string): User | undefined {
    const cleanUsername = username.toLowerCase().trim();
    return this.schema.users.find(u => u.username.toLowerCase() === cleanUsername);
  }

  getUserByEmail(email: string): User | undefined {
    const cleanEmail = email.toLowerCase().trim();
    return this.schema.users.find(u => u.email.toLowerCase() === cleanEmail);
  }

  getProfile(userId: string): Profile | undefined {
    return this.schema.profiles.find(p => p.userId === userId);
  }

  getFollowers(userId: string): Follow[] {
    return this.schema.follows.filter(f => f.followingId === userId);
  }

  getFollowing(userId: string): Follow[] {
    return this.schema.follows.filter(f => f.followerId === userId);
  }

  isFollowing(followerId: string, followingId: string): boolean {
    return this.schema.follows.some(f => f.followerId === followerId && f.followingId === followingId);
  }

  getPosts(): Post[] {
    return this.schema.posts;
  }

  getPostById(id: string): Post | undefined {
    return this.schema.posts.find(p => p.id === id);
  }

  getPostMedia(postId: string): Media[] {
    return this.schema.media.filter(m => m.postId === postId).sort((a, b) => a.order - b.order);
  }

  getComments(postId: string): Comment[] {
    return this.schema.comments.filter(c => c.postId === postId).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getLikes(postId: string): Like[] {
    return this.schema.likes.filter(l => l.postId === postId);
  }

  isPostLiked(userId: string, postId: string): boolean {
    return this.schema.likes.some(l => l.userId === userId && l.postId === postId);
  }

  isPostSaved(userId: string, postId: string): boolean {
    return this.schema.savedPosts.some(sp => sp.userId === userId && sp.postId === postId);
  }

  getSavedPosts(userId: string): SavedPost[] {
    return this.schema.savedPosts.filter(sp => sp.userId === userId);
  }

  getStories(): Story[] {
    // Filter active (non-expired) stories
    const now = new Date();
    return this.schema.stories.filter(s => new Date(s.expiresAt) > now).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getStoryViews(storyId: string): StoryView[] {
    return this.schema.storyViews.filter(sv => sv.storyId === storyId);
  }

  getConversations(userId: string): Conversation[] {
    return this.schema.conversations
      .filter(c => c.participants.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
  }

  getMessages(conversationId: string): Message[] {
    return this.schema.messages
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  getNotifications(userId: string): Notification[] {
    return this.schema.notifications
      .filter(n => n.receiverId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getReports(): Report[] {
    return this.schema.reports;
  }

  getHashtags(): Hashtag[] {
    return this.schema.hashtags;
  }

  // ==========================================================================
  // WRITE & MUTATION METHODS
  // ==========================================================================

  createUser(email: string, passwordHash: string, username: string, name: string): User {
    const newUser: User = {
      id: `u_${generateId()}`,
      email: email.toLowerCase().trim(),
      passwordHash,
      username: username.toLowerCase().trim(),
      name: name.trim(),
      role: 'user',
      createdAt: new Date().toISOString()
    };

    const newProfile: Profile = {
      userId: newUser.id,
      avatarUrl: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop`, // Safe modern placeholder
      coverUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop',
      bio: '',
      website: '',
      location: '',
      isPrivate: false,
      themePreference: 'light'
    };

    this.schema.users.push(newUser);
    this.schema.profiles.push(newProfile);
    this.save();
    return newUser;
  }

  updateProfile(userId: string, updates: Partial<Profile>): Profile | undefined {
    const profile = this.getProfile(userId);
    if (!profile) return undefined;

    Object.assign(profile, updates);
    this.save();
    return profile;
  }

  updateUser(userId: string, updates: { name?: string; username?: string; passwordHash?: string }): User | undefined {
    const user = this.getUserById(userId);
    if (!user) return undefined;

    if (updates.name) user.name = updates.name.trim();
    if (updates.username) user.username = updates.username.toLowerCase().trim();
    if (updates.passwordHash) user.passwordHash = updates.passwordHash;
    this.save();
    return user;
  }

  createPost(userId: string, content: string, mediaUrls: string[]): Post {
    const postTags = this.extractHashtags(content);
    const newPost: Post = {
      id: `p_${generateId()}`,
      userId,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      commentsCount: 0,
      tags: postTags
    };

    // Create post media
    mediaUrls.forEach((url, i) => {
      const isVideo = url.endsWith('.mp4') || url.includes('video');
      const mediaItem: Media = {
        id: `m_${generateId()}`,
        postId: newPost.id,
        url,
        type: isVideo ? 'video' : 'image',
        order: i
      };
      this.schema.media.push(mediaItem);
    });

    // Save tags and handle tag relation count
    postTags.forEach(tag => {
      let hashtag = this.schema.hashtags.find(h => h.tag === tag);
      if (!hashtag) {
        hashtag = { id: `h_${generateId()}`, tag, postCount: 1 };
        this.schema.hashtags.push(hashtag);
      } else {
        hashtag.postCount += 1;
      }

      this.schema.postHashtags.push({
        id: `ph_${generateId()}`,
        postId: newPost.id,
        hashtagId: hashtag.id
      });
    });

    this.schema.posts.unshift(newPost); // Add to beginning of feed
    this.save();
    return newPost;
  }

  updatePost(postId: string, userId: string, content: string): Post | undefined {
    const post = this.getPostById(postId);
    if (!post || post.userId !== userId) return undefined;

    // Clean old hashtags
    const oldTags = post.tags;
    oldTags.forEach(tag => {
      const hashtag = this.schema.hashtags.find(h => h.tag === tag);
      if (hashtag) {
        hashtag.postCount = Math.max(0, hashtag.postCount - 1);
      }
    });
    this.schema.postHashtags = this.schema.postHashtags.filter(ph => ph.postId !== postId);

    // Setup new hashtags
    const newTags = this.extractHashtags(content);
    post.content = content;
    post.tags = newTags;

    newTags.forEach(tag => {
      let hashtag = this.schema.hashtags.find(h => h.tag === tag);
      if (!hashtag) {
        hashtag = { id: `h_${generateId()}`, tag, postCount: 1 };
        this.schema.hashtags.push(hashtag);
      } else {
        hashtag.postCount += 1;
      }

      this.schema.postHashtags.push({
        id: `ph_${generateId()}`,
        postId: post.id,
        hashtagId: hashtag.id
      });
    });

    this.save();
    return post;
  }

  deletePost(postId: string, userId: string, bypassUserCheck: boolean = false): boolean {
    const postIndex = this.schema.posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return false;

    const post = this.schema.posts[postIndex];
    if (!bypassUserCheck && post.userId !== userId) return false;

    // Remove tags relations
    post.tags.forEach(tag => {
      const hashtag = this.schema.hashtags.find(h => h.tag === tag);
      if (hashtag) {
        hashtag.postCount = Math.max(0, hashtag.postCount - 1);
      }
    });

    // CRITICAL CASCADE: Remove children
    this.schema.posts.splice(postIndex, 1);
    this.schema.media = this.schema.media.filter(m => m.postId !== postId);
    this.schema.comments = this.schema.comments.filter(c => c.postId !== postId);
    this.schema.likes = this.schema.likes.filter(l => l.postId !== postId);
    this.schema.savedPosts = this.schema.savedPosts.filter(sp => sp.postId !== postId);
    this.schema.postHashtags = this.schema.postHashtags.filter(ph => ph.postId !== postId);
    this.schema.reports = this.schema.reports.filter(r => !(r.targetType === 'post' && r.targetId === postId));
    this.schema.notifications = this.schema.notifications.filter(n => n.postId !== postId);

    this.save();
    return true;
  }

  toggleLike(userId: string, postId?: string, commentId?: string): { liked: boolean; count: number } {
    if (!postId && !commentId) throw new Error('Must provide either postId or commentId');

    const existingIndex = this.schema.likes.findIndex(
      l => l.userId === userId &&
      (postId ? l.postId === postId : l.commentId === commentId)
    );

    let liked = false;
    if (existingIndex !== -1) {
      // Unlike
      this.schema.likes.splice(existingIndex, 1);
      liked = false;
    } else {
      // Like
      const newLike: Like = {
        id: `l_${generateId()}`,
        userId,
        postId,
        commentId,
        createdAt: new Date().toISOString()
      };
      this.schema.likes.push(newLike);
      liked = true;

      // Realtime Notification trigger
      if (postId) {
        const post = this.getPostById(postId);
        if (post && post.userId !== userId) {
          this.createNotification(userId, post.userId, 'like', postId);
        }
      }
    }

    // Update post counts
    let count = 0;
    if (postId) {
      const post = this.getPostById(postId);
      if (post) {
        const postLikes = this.getLikes(postId);
        post.likesCount = postLikes.length;
        count = post.likesCount;
      }
    }

    this.save();
    return { liked, count };
  }

  createComment(userId: string, postId: string, content: string): Comment {
    const post = this.getPostById(postId);
    if (!post) throw new Error('Post not found');

    const newComment: Comment = {
      id: `c_${generateId()}`,
      postId,
      userId,
      content,
      createdAt: new Date().toISOString()
    };

    this.schema.comments.push(newComment);
    post.commentsCount = this.schema.comments.filter(c => c.postId === postId).length;

    // Send notification
    if (post.userId !== userId) {
      this.createNotification(userId, post.userId, 'comment', postId, newComment.id);
    }

    this.save();
    return newComment;
  }

  deleteComment(commentId: string, userId: string, bypassUserCheck: boolean = false): boolean {
    const commentIndex = this.schema.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) return false;

    const comment = this.schema.comments[commentIndex];
    if (!bypassUserCheck && comment.userId !== userId) return false;

    this.schema.comments.splice(commentIndex, 1);

    // Update Post Comment counts
    const post = this.getPostById(comment.postId);
    if (post) {
      post.commentsCount = this.schema.comments.filter(c => c.postId === comment.postId).length;
    }

    // Cascade delete likes / reports for comment
    this.schema.likes = this.schema.likes.filter(l => l.commentId !== commentId);
    this.schema.reports = this.schema.reports.filter(r => !(r.targetType === 'comment' && r.targetId === commentId));
    this.schema.notifications = this.schema.notifications.filter(n => n.commentId !== commentId);

    this.save();
    return true;
  }

  toggleSavePost(userId: string, postId: string): boolean {
    const existingIndex = this.schema.savedPosts.findIndex(sp => sp.userId === userId && sp.postId === postId);

    if (existingIndex !== -1) {
      this.schema.savedPosts.splice(existingIndex, 1);
      this.save();
      return false; // Unsaved
    } else {
      const newSaved: SavedPost = {
        id: `sp_${generateId()}`,
        userId,
        postId,
        createdAt: new Date().toISOString()
      };
      this.schema.savedPosts.push(newSaved);
      this.save();
      return true; // Saved
    }
  }

  toggleFollow(followerId: string, followingId: string): boolean {
    if (followerId === followingId) return false;

    const existingIndex = this.schema.follows.findIndex(f => f.followerId === followerId && f.followingId === followingId);

    if (existingIndex !== -1) {
      this.schema.follows.splice(existingIndex, 1);
      this.save();
      return false; // Unfollowed
    } else {
      const newFollow: Follow = {
        id: `f_${generateId()}`,
        followerId,
        followingId,
        createdAt: new Date().toISOString()
      };
      this.schema.follows.push(newFollow);

      // Notification
      this.createNotification(followerId, followingId, 'follow');

      this.save();
      return true; // Followed
    }
  }

  createStory(userId: string, mediaUrl: string, mediaType: 'image' | 'video' = 'image'): Story {
    const newStory: Story = {
      id: `st_${generateId()}`,
      userId,
      mediaUrl,
      mediaType,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    };

    this.schema.stories.push(newStory);
    this.save();
    return newStory;
  }

  viewStory(storyId: string, viewerId: string): StoryView | undefined {
    const story = this.schema.stories.find(s => s.id === storyId);
    if (!story) return undefined;

    // Avoid duplicate views
    const existing = this.schema.storyViews.find(sv => sv.storyId === storyId && sv.viewerId === viewerId);
    if (existing) return existing;

    const newView: StoryView = {
      id: `stv_${generateId()}`,
      storyId,
      viewerId,
      createdAt: new Date().toISOString()
    };

    this.schema.storyViews.push(newView);
    this.save();
    return newView;
  }

  createConversation(participantIds: string[], name?: string): Conversation {
    // Avoid double conversations for 1-on-1 chats
    if (participantIds.length === 2 && !name) {
      const sortedIds = [...participantIds].sort();
      const existing = this.schema.conversations.find(
        c => !c.isGroup &&
        c.participants.length === 2 &&
        [...c.participants].sort().every((v, i) => v === sortedIds[i])
      );
      if (existing) return existing;
    }

    const newConv: Conversation = {
      id: `conv_${generateId()}`,
      name,
      isGroup: participantIds.length > 2 || !!name,
      participants: participantIds,
      lastMessageText: '',
      lastMessageAt: new Date().toISOString()
    };

    this.schema.conversations.push(newConv);
    this.save();
    return newConv;
  }

  createMessage(conversationId: string, senderId: string, content: string, mediaUrl?: string, mediaType?: 'image' | 'video'): Message {
    const conv = this.schema.conversations.find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');

    const newMessage: Message = {
      id: `msg_${generateId()}`,
      conversationId,
      senderId,
      content,
      mediaUrl,
      mediaType,
      isSeen: false,
      createdAt: new Date().toISOString()
    };

    this.schema.messages.push(newMessage);

    // Update conversation metrics
    conv.lastMessageText = mediaUrl ? `Sent a media attachment` : content;
    conv.lastMessageAt = newMessage.createdAt;

    // Trigger push notifications to other participants
    conv.participants.forEach(pId => {
      if (pId !== senderId) {
        this.createNotification(senderId, pId, 'message', undefined, undefined, newMessage.id);
      }
    });

    this.save();
    return newMessage;
  }

  markMessagesAsSeen(conversationId: string, userId: string) {
    this.schema.messages.forEach(m => {
      if (m.conversationId === conversationId && m.senderId !== userId) {
        m.isSeen = true;
      }
    });
    this.save();
  }

  createNotification(senderId: string, receiverId: string, type: Notification['type'], postId?: string, commentId?: string, messageId?: string): Notification {
    const newNotif: Notification = {
      id: `nt_${generateId()}`,
      senderId,
      receiverId,
      type,
      postId,
      commentId,
      messageId,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    this.schema.notifications.unshift(newNotif);
    this.save();
    return newNotif;
  }

  markNotificationsAsRead(userId: string) {
    this.schema.notifications.forEach(n => {
      if (n.receiverId === userId) {
        n.isRead = true;
      }
    });
    this.save();
  }

  createReport(reporterId: string, targetType: Report['targetType'], targetId: string, reason: string): Report {
    const newReport: Report = {
      id: `rep_${generateId()}`,
      reporterId,
      targetType,
      targetId,
      reason,
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    this.schema.reports.push(newReport);
    this.save();
    return newReport;
  }

  resolveReport(reportId: string, status: 'resolved' | 'dismissed'): Report | undefined {
    const report = this.schema.reports.find(r => r.id === reportId);
    if (!report) return undefined;

    report.status = status;

    if (status === 'resolved') {
      // Take automated moderation action
      if (report.targetType === 'post') {
        this.deletePost(report.targetId, '', true);
      } else if (report.targetType === 'comment') {
        this.deleteComment(report.targetId, '', true);
      } else if (report.targetType === 'user') {
        this.deleteUser(report.targetId);
      }
    }

    this.save();
    return report;
  }

  deleteUser(userId: string): boolean {
    const userIndex = this.schema.users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;

    // CRITICAL USER CASCADE:
    // 1. Delete profiles
    this.schema.profiles = this.schema.profiles.filter(p => p.userId !== userId);

    // 2. Delete posts (which cascadingly deletes post children)
    const userPostIds = this.schema.posts.filter(p => p.userId === userId).map(p => p.id);
    userPostIds.forEach(pId => this.deletePost(pId, userId, true));

    // 3. Delete comments left by user
    const commentIds = this.schema.comments.filter(c => c.userId === userId).map(c => c.id);
    commentIds.forEach(cId => this.deleteComment(cId, userId, true));

    // 4. Delete user likes
    this.schema.likes = this.schema.likes.filter(l => l.userId !== userId);

    // 5. Delete follow associations
    this.schema.follows = this.schema.follows.filter(f => f.followerId !== userId && f.followingId !== userId);

    // 6. Delete active stories
    this.schema.stories = this.schema.stories.filter(s => s.userId !== userId);
    this.schema.storyViews = this.schema.storyViews.filter(sv => sv.viewerId !== userId);

    // 7. Delete saved posts
    this.schema.savedPosts = this.schema.savedPosts.filter(sp => sp.userId !== userId);

    // 8. Delete notifications
    this.schema.notifications = this.schema.notifications.filter(n => n.senderId !== userId && n.receiverId !== userId);

    // 9. Remove from conversations participants
    this.schema.conversations.forEach(c => {
      c.participants = c.participants.filter(pId => pId !== userId);
    });
    this.schema.conversations = this.schema.conversations.filter(c => c.participants.length > 0);

    // 10. Splice users
    this.schema.users.splice(userIndex, 1);

    this.save();
    return true;
  }

  // ==========================================================================
  // HELPER METRICS & UTILITIES
  // ==========================================================================

  private extractHashtags(text: string): string[] {
    const tags: string[] = [];
    const regex = /#([a-zA-Z0-9_]+)/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const tag = match[1].toLowerCase().trim();
      if (tag && !tags.includes(tag)) {
        tags.push(tag);
      }
    }
    return tags;
  }

  getAdminStats(): AdminStats {
    const now = Date.now();
    const activeUsers24h = this.schema.users.filter(u => {
      // Quick fallback metric for activity
      const isCreator = this.schema.posts.some(p => p.userId === u.id && (now - new Date(p.createdAt).getTime()) < 24 * 60 * 60 * 1000);
      const isMessenger = this.schema.messages.some(m => m.senderId === u.id && (now - new Date(m.createdAt).getTime()) < 24 * 60 * 60 * 1000);
      return isCreator || isMessenger || u.role === 'admin';
    }).length;

    return {
      usersCount: this.schema.users.length,
      postsCount: this.schema.posts.length,
      storiesCount: this.schema.stories.length,
      reportsCount: this.schema.reports.length,
      activeUsers24h: Math.max(1, activeUsers24h)
    };
  }
}

export const db = new Database();
export { hashPassword };
