import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  website: string;
};
type UserInput = Omit<User, "id">;

const baseUrl = "http://localhost:3001";
const usersUrl = `${baseUrl}/users`;

const fetchUsers = async (): Promise<Array<User>> => {
  const response = await fetch(usersUrl);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

const fetchUser = async (id: number): Promise<User> => {
  const response = await fetch(`${usersUrl}/${id}`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return await response.json();
};

const createUser = async (user: UserInput): Promise<User> => {
  const response = await fetch(usersUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });
  if (!response.ok) {
    throw new Error("User not created");
  }
  const data = await response.json();
  return data;
};

const updateUser = async (user: User): Promise<any> => {
  const response = await fetch(`${usersUrl}/${user.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error("User not found");
  }
  const data = await response.json();
  return data;
};

const deleteUserResponse = async (id: number): Promise<void> => {
  const response = await fetch(`${usersUrl}/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("User not deleted");
  }
  return;
};

const userKeys = {
  all: ["users"] as const,
  detail: (id: number) => [...userKeys.all, id] as const,
};

const useUsers = () => {
  return useQuery({
    queryKey: userKeys.all,
    queryFn: () => fetchUsers(),
  });
};

const useUser = (id: number) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => fetchUser(id),
  });
};

const useCreateUser = () => {
  return useMutation({
    mutationFn: (user: UserInput) => createUser(user),
    onSuccess: (data) => {
      console.log("User created successfully", data);
    },
    onError: (error) => {
      console.error("Error creating user", error);
    },
  });
};

const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => updateUser(user),
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ queryKey: ["users", newUser.id] });
      const previousUser = queryClient.getQueryData(["users", newUser.id]);
      queryClient.setQueryData(["users", newUser.id], newUser);
      return { previousUser, newUser: newUser };
    },
    onError: (err, newUser, context) => {
      console.error("Error updating user", err);
      queryClient.setQueryData(
        ["users", context?.newUser.id],
        context?.previousUser
      );
    },
    onSettled: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["users", data?.id],
      });
    },
    mutationKey: ["updateUser"],
  });
};

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUserResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: userKeys.all,
      });
    },
    onError: (error) => {
      console.error("Error deleting user", error);
    },
  });
};

export {
  useUsers,
  useUser,
  useUpdateUser,
  useCreateUser,
  useDeleteUser,
  fetchUsers,
  fetchUser,
};
