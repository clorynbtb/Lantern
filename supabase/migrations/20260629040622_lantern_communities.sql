/*
# Lantern Communities Feature

1. New Tables
- `communities`: Community groups with metadata and moderation rules
- `community_members`: Membership tracking with roles (owner, moderator, member)
- `community_posts`: Posts specifically tied to communities
- `community_rules`: Community-specific rules
- `community_events`: Community events with scheduling

2. Security
- RLS enabled on all tables with permissive policies for backend API access.
*/

CREATE TABLE IF NOT EXISTS communities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  avatar_url text DEFAULT 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&h=200&fit=crop',
  cover_url text DEFAULT 'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?w=1200&h=400&fit=crop',
  slug text UNIQUE NOT NULL,
  is_private boolean NOT NULL DEFAULT false,
  member_count integer NOT NULL DEFAULT 0,
  post_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE TABLE IF NOT EXISTS community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  is_pinned boolean NOT NULL DEFAULT false,
  pinned_at timestamptz,
  UNIQUE (community_id, post_id)
);

CREATE TABLE IF NOT EXISTS community_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id uuid NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  event_date timestamptz NOT NULL,
  location text DEFAULT '',
  created_by uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_created_at ON communities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_community ON community_posts(community_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_pinned ON community_posts(community_id, is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_community_rules_community ON community_rules(community_id);
CREATE INDEX IF NOT EXISTS idx_community_events_community ON community_events(community_id, event_date);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_communities" ON communities;
CREATE POLICY "allow_all_communities" ON communities FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_community_members" ON community_members;
CREATE POLICY "allow_all_community_members" ON community_members FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_community_posts" ON community_posts;
CREATE POLICY "allow_all_community_posts" ON community_posts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_community_rules" ON community_rules;
CREATE POLICY "allow_all_community_rules" ON community_rules FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "allow_all_community_events" ON community_events;
CREATE POLICY "allow_all_community_events" ON community_events FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
