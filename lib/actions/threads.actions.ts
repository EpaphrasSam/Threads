"use server"

import { revalidatePath } from "next/cache";
import prisma from "../prisma"
import { LikesCount, UserLikesCheck } from "./like.action";

interface Params {
    text: string,
    author:string,
    communityId: string | null,
    path: string
}

export async function createThread({ text, author, communityId, path }: Params) {
  try {
    const createdThread = await prisma.thread.create({
      data: {
        text,
        author: { connect: { id: author } },
        community: communityId ? { connect: { id: communityId } } : undefined,
        
      },
    });

    
    await prisma.user.update({
      where: { id: author },
      data: {
        threads: {
          connect: { id: createdThread.id },
        },
      },
    });

    if (communityId) {
      
      await prisma.community.update({
        where: { id: communityId },
        data: {
          threads: {
            connect: { id: createdThread.id },
          },
        },
      });
    }

    
    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20, currentUserId:string) {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;

    const threads = await prisma.thread.findMany({
      where: {
        OR: [
          { parentId: null },
          { parentId: { isSet: false } },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        author: true,
        community: true,
        children: {
          where: {
        OR: [
          { parentCommentId: null },
          { parentCommentId: { isSet: false } },
        ],
      },
          include: {
            author: true,
            childComments: {
              include: {
                author: true,
              },
            },
          },
        },
      },
    });

    
    const threadInfoPromises = threads.map(async (thread) => {
      const threadId = thread.id;
      const [likesCount, userLikes] = await Promise.all([
        LikesCount(threadId),
        UserLikesCheck(currentUserId, threadId),
      ]);
      return {
        ...thread,
        likesCount,
        userLikes,
      };
    });

    const threadsInfo = await Promise.all(threadInfoPromises);

    const totalPostsCount = await prisma.thread.count({
      where: {
        OR: [
          { parentId: null },
          { parentId: { isSet: false } },
        ],
      },
    });

    const isNext = totalPostsCount > skipAmount + threads.length;

    return { threads: threadsInfo, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch threads: ${error.message}`);
  }
}


export async function fetchThreadById(threadId: string, currentUserId: string) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: true,
        community: true,
        children: {
          where: {
            OR: [
              { parentCommentId: null },
              { parentCommentId: { isSet: false } },
            ],
          },
          orderBy: { createdAt: "asc" },
          include: {
            author: true,
            childComments: {
              orderBy: { createdAt: "asc" },
              include: {
                author: true,
                likes: {
                  where: {
                    userId: currentUserId,
                  },
                },
              },
            },
            likes: {
              where: {
                userId: currentUserId,
              },
            },
          },
        },
        likes: {
          where: {
            userId: currentUserId,
          },
        },
      },
    });

    if (!thread) {
      return null;
    }

    
    const addLikesInfo = (obj:any) => {
      obj.likesCount = obj.likes.length;
      obj.userLikes = obj.likes.length > 0;

      if (obj.children) {
        for (const comment of obj.children) {
          comment.likesCount = comment.likes.length;
          comment.userLikes = comment.likes.length > 0;

          if (comment.childComments) {
            for (const childComment of comment.childComments) {
              childComment.likesCount = childComment.likes.length;
              childComment.userLikes = childComment.likes.length > 0;
            }
          }
        }
      }
    };

    addLikesInfo(thread);

    return thread;
  } catch (err) {
    throw new Error(`Error while fetching thread: ${err}`);
  }
}


export async function addCommentToThread(threadId:string, commentText:string, userId:string, path:string, parentCommentId?: string) {
  try {
    const originalThread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!originalThread) {
      throw new Error('Thread not found');
    }

    const commentData: any = {
      text: commentText,
      author: {
        connect: { id: userId },
      },
      parent: {
          connect: { id: parentCommentId ? parentCommentId : threadId },
        },
    };

    if(parentCommentId){
       commentData.parentComment = {
        connect: { id: threadId },
      }
    }
    
    const savedCommentThread = await prisma.thread.create({
      data: commentData,
    });

    await prisma.thread.update({
      where: { id: parentCommentId ? parentCommentId : threadId },
      data: {
        children: {
          connect: { id: savedCommentThread.id },
        },
      },
    });

    revalidatePath(path);
  } catch (error:any) {
    throw new Error(`Error adding comment to thread: ${error.message}`)
  }
}

export async function countTotalThreads(id: string, condition: 'user' | 'community'): Promise<number> {
  try {
    if (condition === 'user') {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
        include: {
          threads: {
            where:{
               OR: [
          { parentId: null },
          { parentId: { isSet: false } },
        ]
            }
          },
        },
      });
      if (!user) {
        throw new Error('User not found');
      }
      return user.threads.length;
    } else if (condition === 'community') {
      const community = await prisma.community.findUnique({
        where: {
          id,
        },
        include: {
          threads: true,
        },
      });
      if (!community) {
        throw new Error('Community not found');
      }
      return community.threads.length;
    } else {
      throw new Error('Invalid condition. Use "user" or "community".');
    }
  } catch (error) {
    console.error('Error counting total threads:', error);
    throw error;
  }
}
