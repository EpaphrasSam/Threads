"use server"

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';


export async function likeThreadOrComment(userId: string, threadId: string, path:string) {
  try {
    const existingLike = await prisma.like.findFirst({
      where: {
        userId,
        threadId,
      },
    });

    if (!existingLike) {
      await prisma.like.create({
        data: {
          user: { connect: { id: userId } },
          thread: { connect: { id: threadId } },
        },
      });
    } else {
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    }
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to like/unlike: ${error.message}`);
  }
}


export async function UserLikesCheck(userId: string, threadId: string) {
  try {
    const like = await prisma.like.findFirst({
      where: {
        userId,
        threadId,
      },
    });

    return !!like;
  } catch (error: any) {
    throw new Error(`Failed to check likes: ${error.message}`);
  }
}


export async function LikesCount(threadId: string) {
  try {
    const likesCount = await prisma.like.count({
      where: {
        threadId,
      },
    });

    return likesCount;
  } catch (error: any) {
    throw new Error(`Failed to get likes count: ${error.message}`);
  }
}

export async function LikedUsers(threadId: string) {
  try {
    const likes = await prisma.like.findMany({
      where: {
        threadId,
      },
      include: {
        user: true,
      },
    });

    return likes.map((like) => like.user);
  } catch (error: any) {
    throw new Error(`Failed to get liked users: ${error.message}`);
  }
}
