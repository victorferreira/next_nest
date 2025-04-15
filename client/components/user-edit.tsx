"use client";

import { useParams, useRouter } from "next/navigation";
import { useUpdateUser, useUser } from "../hooks/users";

export default function EditUser() {
  const params = useParams();
  const id = params?.id as unknown as number;
  const { data: user, isLoading, isError, refetch } = useUser(id as number);
  const router = useRouter();
  const mutation = useUpdateUser();

  function handleForm(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;

    mutation.mutate(
      { id, name, email, phone, website },
      {
        onSuccess: (data) => {
          router.push("/users/" + data.id);
        },
      }
    );
  }

  if (isLoading || mutation.isPending) return <h1>Loading...</h1>;
  if (isError) return <h1>Error loading user</h1>;
  if (!user) return <h1>User not found</h1>;

  if (mutation.isError) {
    return <h1>Error updating user</h1>;
  }

  return (
    <div>
      <h1>Update User</h1>

      <form action={handleForm}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            placeholder="Name"
            defaultValue={user.name}
          />
        </label>

        <label>
          Email:
          <input
            type="email"
            name="email"
            placeholder="Email"
            defaultValue={user.email}
          />
        </label>

        <label>
          Phone:
          <input
            type="tel"
            name="phone"
            placeholder="1-234-567-8900"
            defaultValue={user.phone}
          />
        </label>

        <label>
          Website
          <input
            type="url"
            name="website"
            placeholder="https://example.com"
            defaultValue={user.website}
          />
        </label>
        <button type="submit">Update User</button>
      </form>
    </div>
  );
}
