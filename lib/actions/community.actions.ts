 import prisma from "../prisma";

export async function createCommunity(
  id: string,
  name: string,
  username: string,
  image: string,
  bio: string,
  createdById: string
) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: createdById,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const createdCommunity = await prisma.community.create({
      data: {
        id,
        name,
        username,
        image,
        bio,
        createdBy: {
          connect: {
            id: user.id,
          },
        }, 
        members: {
      connect: {
        id: user.id,
      },
    },  
      },
    });

    return createdCommunity;
  } catch (error) {
    console.error('Error creating community:', error);
    throw error;
  }
}

export async function fetchCommunityDetails(id: string) {
  try {
    const communityDetails = await prisma.community.findUnique({
      where: {
        id,
      },
      include: {
        createdBy: true,
        members: {
          select: {
            name: true,
            username: true,
            image: true,
            id: true,
          },
        },
      },
    });

    return communityDetails;
  } catch (error) {
    console.error('Error fetching community details:', error);
    throw error;
  }
}


export async function fetchCommunityPosts(id: string) {
  try {
    const communityPosts = await prisma.community.findUnique({
      where: {
        id,
      },
      include: {
        threads: {
          include: {
            author: {
              select: {
                name: true,
                image: true,
                id: true,
              },
            },
            children: {
              include: {
                author: {
                  select: {
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

    return communityPosts;
  } catch (error) {
    console.error('Error fetching community posts:', error);
    throw error;
  }
}


export async function fetchCommunities({
  searchString = '',
  pageNumber = 1,
  pageSize = 20,
  sortBy = 'desc',
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: 'asc' | 'desc';
}) {
  try {
    const skipAmount = (pageNumber - 1) * pageSize;


    const communities = await prisma.community.findMany({
      where: {
        ...(searchString.trim() !== '' ? {
          OR: [
            {
              username: {
                contains: searchString,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: searchString,
                mode: 'insensitive',
              },
            },
          ],
        } : {}),
      },
      orderBy: {
        id: sortBy,
      },
      skip: skipAmount,
      take: pageSize,
      include: {
        members: {
          select: {
            name: true,
            username: true,
            image: true,
            id: true,
          },
        },
      },
    });

    const totalCommunitiesCount = await prisma.community.count({
  where: {
    ...(searchString.trim() !== '' ? {
      OR: [
        {
          username: {
            contains: searchString,
            mode: 'insensitive',
          },
        },
        {
          name: {
            contains: searchString,
            mode: 'insensitive',
          },
        },
      ],
    } : {}),
  },
});


    const isNext = totalCommunitiesCount > skipAmount + communities.length;

    return { communities, isNext };
  } catch (error) {
    console.error('Error fetching communities:', error);
    throw error;
  }
}


export async function addMemberToCommunity(communityId: string, memberId: string) {
  try {
    const community = await prisma.community.findUnique({
      where: {
        id: communityId,
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    const user = await prisma.user.findUnique({
      where: {
        id: memberId,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.community.update({
      where: {
        id: community.id,
      },
      data: {
        members: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return community;
  } catch (error) {
    console.error('Error adding member to community:', error);
    throw error;
  }
}



export async function removeUserFromCommunity(userId: string, communityId: string) {
  try {
    const userIdObject = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!userIdObject) {
      throw new Error('User not found');
    }

    await prisma.community.update({
      where: {
        id: communityId,
      },
      data: {
        members: {
          disconnect: {
            id: userIdObject.id,
          },
        },
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Error removing user from community:', error);
    throw error;
  }
}


export async function updateCommunityInfo(
  communityId: string,
  name: string,
  username: string,
  image: string
) {
  try {
    const updatedCommunity = await prisma.community.update({
      where: {
        id: communityId,
      },
      data: {
        name,
        username,
        image,
      },
    });

    if (!updatedCommunity) {
      throw new Error('Community not found');
    }

    return updatedCommunity;
  } catch (error) {
    console.error('Error updating community information:', error);
    throw error;
  }
}

export async function deleteCommunity(communityId: string) {
  try {
    const deletedCommunity = await prisma.community.delete({
      where: {
        id: communityId,
      },
    });

    if (!deletedCommunity) {
      throw new Error('Community not found');
    }

    await prisma.thread.deleteMany({
      where: {
        communityId: deletedCommunity.id,
      },
    });

    const communityUsers = await prisma.user.findMany({
      where: {
        communities: {
          some: {
            id: communityId,
          },
        },
      },
    });

    const updateUserPromises = communityUsers.map(async (user) => {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          communities: {
            disconnect: {
              id: communityId,
            },
          },
        },
      });
    });

    await Promise.all(updateUserPromises);

    return deletedCommunity;
  } catch (error) {
    console.error('Error deleting community:', error);
    throw error;
  }
}
