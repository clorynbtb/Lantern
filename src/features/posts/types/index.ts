export type PostVisibility = 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE';

export interface PostRecord {
  id: string;
  authorId: string;
  content: string;
  visibility: PostVisibility;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostInput {
  content: string;
  visibility?: PostVisibility;
}

export interface DeletePostInput {
  postId: string;
}

export interface PostFeedQuery {
  cursor?: string;
  take?: number;
}

export interface PostListResponse {
  posts: PostRecord[];
  nextCursor?: string;
}
