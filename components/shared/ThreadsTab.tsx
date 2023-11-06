import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  let threads;

  if (accountType === "Community") {
    const results = await fetchCommunityPosts(accountId);
    threads = results?.threads;
  } else {
    const results = await fetchUserPosts(accountId);
    threads = results?.threads;
  }

  return (
    <section className="mt-9 flex flex-col gap-10">
      {threads?.map((thread: any) => (
        <ThreadCard
          key={thread?.id}
          id={thread?.id}
          currentUserId={currentUserId}
          parentId={thread?.parentId}
          content={thread?.text}
          author={thread?.author}
          community={thread?.community}
          createdAt={thread?.createdAt}
          comments={thread?.children}
          likesCount={thread?.likesCount}
          userLikes={thread?.userLikes}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
