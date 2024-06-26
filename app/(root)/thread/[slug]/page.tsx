import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
import { fetchThreadById } from "@/lib/actions/threads.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Threads = async ({ params }: { params: { slug: string } }) => {
  if (!params.slug) return null;
  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");

  const thread: any = await fetchThreadById(params.slug, userInfo.id);

  return (
    <section className="relative">
      <div>
        <ThreadCard
          key={thread?.id}
          id={thread?.id}
          currentUserId={userInfo?.id}
          parentId={thread?.parentId}
          content={thread?.text}
          author={thread?.author}
          community={thread?.community}
          createdAt={thread?.createdAt}
          comments={thread?.children}
          likesCount={thread?.likesCount}
          userLikes={thread?.userLikes}
        />
      </div>

      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserImg={userInfo.image}
          currentUserId={JSON.stringify(userInfo.id)}
        />
      </div>

      <div className="mt-3">
        {thread.children.map((childthread: any) => (
          <ThreadCard
            key={childthread?.id}
            id={childthread?.id}
            currentUserId={userInfo?.id}
            parentId={childthread?.parentId}
            content={childthread?.text}
            author={childthread?.author}
            community={childthread?.community}
            createdAt={childthread?.createdAt}
            comments={childthread?.childComments}
            likesCount={childthread?.likesCount}
            userLikes={childthread?.userLikes}
            isComment
          />
        ))}
      </div>
    </section>
  );
};

export default Threads;
