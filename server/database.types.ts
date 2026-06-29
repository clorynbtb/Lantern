/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          username: string;
          name: string;
          role: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          username: string;
          name: string;
          role?: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          username?: string;
          name?: string;
          role?: string;
          created_at?: string | null;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          avatar_url: string | null;
          cover_url: string | null;
          bio: string | null;
          website: string | null;
          location: string | null;
          is_private: boolean | null;
          theme_preference: string | null;
          settings: Json | null;
        };
        Insert: {
          user_id: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          is_private?: boolean | null;
          theme_preference?: string | null;
          settings?: Json | null;
        };
        Update: {
          user_id?: string;
          avatar_url?: string | null;
          cover_url?: string | null;
          bio?: string | null;
          website?: string | null;
          location?: string | null;
          is_private?: boolean | null;
          theme_preference?: string | null;
          settings?: Json | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          created_at: string | null;
          likes_count: number | null;
          comments_count: number | null;
          tags: string[] | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string;
          created_at?: string | null;
          likes_count?: number | null;
          comments_count?: number | null;
          tags?: string[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          created_at?: string | null;
          likes_count?: number | null;
          comments_count?: number | null;
          tags?: string[] | null;
        };
      };
      media: {
        Row: {
          id: string;
          post_id: string | null;
          story_id: string | null;
          url: string;
          type: string;
          order: number | null;
        };
        Insert: {
          id?: string;
          post_id?: string | null;
          story_id?: string | null;
          url: string;
          type: string;
          order?: number | null;
        };
        Update: {
          id?: string;
          post_id?: string | null;
          story_id?: string | null;
          url?: string;
          type?: string;
          order?: number | null;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string | null;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string | null;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          post_id: string | null;
          comment_id: string | null;
          message_id: string | null;
          is_read: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          type: string;
          post_id?: string | null;
          comment_id?: string | null;
          message_id?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          sender_id?: string;
          receiver_id?: string;
          type?: string;
          post_id?: string | null;
          comment_id?: string | null;
          message_id?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };
      conversations: {
        Row: {
          id: string;
          name: string | null;
          is_group: boolean | null;
          last_message_text: string | null;
          last_message_at: string | null;
        };
        Insert: {
          id?: string;
          name?: string | null;
          is_group?: boolean | null;
          last_message_text?: string | null;
          last_message_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string | null;
          is_group?: boolean | null;
          last_message_text?: string | null;
          last_message_at?: string | null;
        };
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          user_id?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          media_url: string | null;
          media_type: string | null;
          is_seen: boolean | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string;
          media_url?: string | null;
          media_type?: string | null;
          is_seen?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          media_url?: string | null;
          media_type?: string | null;
          is_seen?: boolean | null;
          created_at?: string | null;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          media_url: string;
          media_type: string;
          expires_at: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_url: string;
          media_type: string;
          expires_at: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          media_url?: string;
          media_type?: string;
          expires_at?: string;
          created_at?: string | null;
        };
      };
      story_views: {
        Row: {
          id: string;
          story_id: string;
          viewer_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          story_id: string;
          viewer_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          story_id?: string;
          viewer_id?: string;
          created_at?: string | null;
        };
      };
      saved_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string | null;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status: string | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: string;
          target_id: string;
          reason: string;
          status?: string | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: string;
          target_id?: string;
          reason?: string;
          status?: string | null;
          created_at?: string | null;
        };
      };
      hashtags: {
        Row: {
          id: string;
          tag: string;
          post_count: number | null;
        };
        Insert: {
          id?: string;
          tag: string;
          post_count?: number | null;
        };
        Update: {
          id?: string;
          tag?: string;
          post_count?: number | null;
        };
      };
      post_hashtags: {
        Row: {
          id: string;
          post_id: string;
          hashtag_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          hashtag_id: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          hashtag_id?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
