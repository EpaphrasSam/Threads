import UserCard from "@/components/cards/UserCard";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import React from "react";

const Search = async () => {
  const user = await currentUser();

  if (!user) return null;
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  const { users, isNext } = await fetchUsers({
    userId: user.id,
    searchString: "",
  });

  return (
    <h1 className="head-text mb-10">
      <div className="mt-14 flex flex-col gap-9">
        {users.length === 0 ? (
          <p className="no-result">No users found</p>
        ) : (
          <>
            {users.map((user) => (
              <UserCard
                key={user.id}
                id={user.id}
                name={user.name}
                username={user.username}
                imgUrl={user.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </h1>
  );
};

export default Search;
