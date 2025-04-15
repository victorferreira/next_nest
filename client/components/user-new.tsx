"use client";

import { useCreateUser } from "../hooks/users";
import { useRouter } from "next/navigation";

export default function NewUser() {
  const router = useRouter();
  const mutation = useCreateUser();

  function handleForm(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const website = formData.get("website") as string;

    mutation.mutate(
      { name, email, phone, website },
      {
        onSuccess: (data) => {
          console.log("User created successfully", data);
          router.push("/users/" + data.id);
        },
      }
    );
  }

  return (
    <div>
      <h1>New User</h1>

      <form action={handleForm}>
        <label>
          Name:
          <input type="text" name="name" placeholder="Name" />
        </label>

        <label>
          Email:
          <input type="email" name="email" placeholder="Email" />
        </label>

        <label>
          Phone:
          <input type="tel" name="phone" placeholder="1-234-567-8900" />
        </label>

        <label>
          Website
          <input type="url" name="website" placeholder="https://example.com" />
        </label>
        <button type="submit">Create User</button>
      </form>
    </div>
  );
}
