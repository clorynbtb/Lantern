import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getFeedPosts({ cursor, take = 10 }: { cursor?: string; take?: number } = {}) {
  const posts = await prisma.post.findMany({
    take: take + 1,
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      },
    },
  });

  const hasMore = posts.length > take;
  const items = hasMore ? posts.slice(0, take) : posts;
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined;

  return {
    posts: items,
    nextCursor,
  };
}

export async function createPost(authorId: string, content: string, visibility: 'PUBLIC' | 'FOLLOWERS' | 'PRIVATE' = 'PUBLIC') {
  return prisma.post.create({
    data: {
      authorId,
      content,
      visibility,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
        },
      },
    },
  });
}

export async function deletePost(postId: string, authorId: string) {
  return prisma.post.deleteMany({
    where: {
      id: postId,
      authorId,
    },
  });
}
