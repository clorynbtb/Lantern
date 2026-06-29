import { z } from 'zod';
import { createPost, deletePost, getFeedPosts } from '../services/post.service';
import { createApiHandler, type ApiRequest } from '../../../lib/server/api';
import type { ApiResponse } from '../../../lib/server/types';
import { checkPermission } from '../../../lib/server/permissions';

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  visibility: z.enum(['PUBLIC', 'FOLLOWERS', 'PRIVATE']).optional(),
});

const deletePostSchema = z.object({
  postId: z.string().min(1),
});

export async function GET(request: ApiRequest) {
  return createApiHandler(async () => {
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') || undefined;
    const take = Number(searchParams.get('take') || '10');

    const result = await getFeedPosts({ cursor, take });
    return {
      success: true,
      data: result.posts,
      meta: {
        total: result.posts.length,
        cursor: result.nextCursor,
      },
    } satisfies ApiResponse<unknown[]>;
  })(request);
}

export async function POST(request: ApiRequest) {
  return createApiHandler(async (parsedBody) => {
    const user = undefined;

    const allowed = checkPermission(user, 'CREATE_POST', { type: 'post' });
    if (!allowed) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required to create a post.',
        },
      };
    }

    const created = await createPost('demo-user', parsedBody.content, parsedBody.visibility ?? 'PUBLIC');
    return {
      success: true,
      data: created,
    } satisfies ApiResponse<unknown>;
  }, createPostSchema)(request);
}

export async function DELETE(request: ApiRequest) {
  return createApiHandler(async (parsedBody) => {
    const user = undefined;
    const allowed = checkPermission(user, 'DELETE_POST', { type: 'post' });
    if (!allowed) {
      return {
        success: false,
        error: {
          code: 'AUTH_REQUIRED',
          message: 'Authentication is required to delete a post.',
        },
      };
    }

    const result = await deletePost(parsedBody.postId, 'demo-user');
    return {
      success: true,
      data: { deletedCount: result.count },
    } satisfies ApiResponse<{ deletedCount: number }>;
  }, deletePostSchema)(request);
}
