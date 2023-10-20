import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/threads.actions";
import { UserButton, currentUser } from "@clerk/nextjs";

export default async function Home() {
  const { threads, isNext } = await fetchThreads();
  const user = await currentUser();

  return (
    <div>
      {/* <h1 className="head-text text-left">Home</h1> */}

      <section className="mt-9 flex flex-col gap-10">
        {threads.length === 0 ? (
          <p className="no-result">No threads found</p>
        ) : (
          <>
            {threads.map((thread) => (
              <ThreadCard
                key={thread?.id}
                id={thread?.id}
                currentUserId={user?.id || ""}
                parentId={thread?.parentId}
                content={thread?.text}
                author={thread?.author}
                community={thread?.community}
                createdAt={thread?.createdAt}
                comments={thread?.children}
              />
            ))}
          </>
        )}
      </section>
    </div>
  );
}
