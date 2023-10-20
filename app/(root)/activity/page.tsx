import React from "react";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

const Activity = async () => {
  const user = await currentUser();

  if (!user) return null;
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  const activity = await getActivity(user.id);

  return (
    <section className="mt-10 flex flex-col gap-5">
      {activity.length > 0 ? (
        <>
          {activity.map((activity: any) => (
            <Link key={activity.id} href={`/thread/${activity.parentId}`}>
              <article className="activity-card">
                <Image
                  src={activity.author.image}
                  alt="Profile Picture"
                  width={20}
                  height={20}
                  className="rounded-full"
                />
                <p className="!text-small-regular text-light-1">
                  <span className="mr-1 text-primary-500">
                    {activity.author.name}
                  </span>{" "}
                  replied to your thread
                </p>
              </article>
            </Link>
          ))}
        </>
      ) : (
        <div className="flex items-center justify-center">
          <p className="!text-base-regular text-light-3">No activtiy found</p>
        </div>
      )}
    </section>
  );
};

export default Activity;
