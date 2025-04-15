"use client";

import { useDeleteUser, useUsers } from "../hooks/users";
import Link from "next/link";

export default function UserList() {
  const { data: users, isLoading, isError } = useUsers();
  const mutation = useDeleteUser();

  if (isLoading) return <h1>Loading...</h1>;
  if (isError) return <h1>Error loading users</h1>;
  if (!users) return <h1>No users found</h1>;

  const handleDeleteUser = (id: number) => {
    mutation.mutate(id);
  };

  return (
    <>
      <h1>Users</h1>

      <Link href="/users/new">New User</Link>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            <Link href={`/users/${user.id}`}>{user.name}</Link>
            <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}
