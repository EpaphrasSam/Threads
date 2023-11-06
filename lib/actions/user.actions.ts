"use server"

import { revalidatePath } from 'next/cache';
import prisma from '../prisma';

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  bio,
  name,
  path,
  username,
  image,
}: Params): Promise<void> {
  try {
     await prisma.user.upsert({
      where: { id: userId },
      update: {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      create: {
        id:userId,
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
    });

    if (path === '/profile/edit') {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    return await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });
  } catch (error:any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
   const threads = await prisma.user.findUnique({
  where: {
    id: userId,
  },
  include: {
    threads: {
      where: {
           OR: [
      { parentId: null },
      { parentId: { isSet: false } },
    ]
      },
      include: {
        author: {
          select: {
            name: true,
            image: true,
            id: true,
          },
        },
        community: {
          select: {
            name: true,
            id: true,
            image: true,
          },
        },
        children: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
                id: true,
              },
            },
          },
        },
      },
    },
  },
});

    return threads;
  } catch (error:any) {
  
    throw new Error(`Failed to fetch user threads`,error.message)
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 25,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'asc' | 'desc';
}) {
  try {
   const users = await prisma.user.findMany({
  where: {
    id: { not: userId },
    ...(searchString.trim()
      ? {
          OR: [
            { username: { contains: searchString, mode: 'insensitive' } },
            { name: { contains: searchString, mode: 'insensitive' } },
          ],
        }
      : {}), 
      },
  skip: (pageNumber - 1) * pageSize,
  take: pageSize,
});


    const totalUsersCount = await prisma.user.count({where: {
        id: { not: userId },
        OR: searchString
          ? [
              { username: { contains: searchString, mode: 'insensitive' } },
              { name: { contains: searchString, mode: 'insensitive' } },
            ]
          : undefined,
      }});

    
    const isNext = totalUsersCount > users.length + (pageNumber - 1) * pageSize;

    return { users, isNext }
    } catch (error:any) {
    throw new Error(`Failed to fetch users: ${error.message}`)
  }
}


export async function getActivity(userId: string) {
  try {
   
    const userThreads = await prisma.thread.findMany({
      where: {
        authorId: userId,
      },
      include: {
        children: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
                id: true,
              },
            },
          },
        },
      },
    });

    
    const replies = userThreads.flatMap((userThread) => userThread.children.filter(child => child.author.id !== userId));


    return replies;
  } catch (error:any) {
    throw new Error(`Failed to fetch activity: ${error.message}`) 
  }
}