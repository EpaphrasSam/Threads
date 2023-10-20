"use server"

import { revalidatePath } from "next/cache";
import prisma from "../prisma"

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

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  try {

    const skipAmount = (pageNumber - 1) * pageSize;
    
    const threads = await prisma.thread.findMany({
      // where: {
      //   parentId:  null,
      // },
      orderBy: {
        createdAt: 'desc',
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
           
          },
        },
        community: true,
        children: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
                threads: {
                    select: {
                      parentId: true
                    },
                  }, 
            },
        },
    },
},
      },
    });

  
    

    const totalPostsCount = await prisma.thread.count({
      where: {
        parentId:  null 
      },
    });

    
    

    const isNext = totalPostsCount > skipAmount + threads.length;

    return { threads, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch threads: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  try {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        community: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        children: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
      },
    });

    return thread;
  } catch (err:any) {
    throw new Error("Error while fetching thread:", err);
    
  }
}

export async function addCommentToThread(threadId:string, commentText:string, userId:string, path:string) {
  try {
    const originalThread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!originalThread) {
      throw new Error('Thread not found');
    }

    const savedCommentThread = await prisma.thread.create({
      data: {
        text: commentText,
        author: {
          connect: { id: userId },
        },
        parent: {
          connect: { id: threadId },
        },
      },
    });

    await prisma.thread.update({
      where: { id: threadId },
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