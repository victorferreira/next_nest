"use client";

import { useParams } from "next/navigation";
import { useUser } from "../hooks/users";

export default function UserDetail() {
  const params = useParams();
  const id = params?.id as unknown as number;
  const { data: user, isLoading, isError } = useUser(id);

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error loading user</h1>;
  if (!user) return <h1>User not found</h1>;

  return (
    <>
      <h1>User: {user.name}</h1>
      <p>Details about the user will go here.</p>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </>
  );
}
