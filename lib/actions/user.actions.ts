"use server"

import { revalidatePath } from 'next/cache';
import prisma from '../connect';

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
      // where: {
      //   parentId: null // Optionally, filter for parent threads only
      // },
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


