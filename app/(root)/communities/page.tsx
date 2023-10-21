import CommunityCard from "@/components/cards/CommunityCard";
import UserCard from "@/components/cards/UserCard";
import Pagination from "@/components/shared/Pagination";
import Searchbar from "@/components/shared/Searchbar";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Communities = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const user = await currentUser();

  if (!user) return null;
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  const { communities, isNext } = await fetchCommunities({
    searchString: searchParams.q || "",
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 25,
  });

  return (
    <>
      <h1 className="head-text mb-10"></h1>
      <Searchbar routeType="/communities" />
      <div className="mt-14 flex flex-col gap-9">
        {communities.length === 0 ? (
          <p className="no-result">No communities found</p>
        ) : (
          <>
            {communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                members={community.members}
                bio={community.bio}
              />
            ))}
          </>
        )}
      </div>
      <Pagination
        path="/communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={isNext}
      />
    </>
  );
};

export default Communities;
