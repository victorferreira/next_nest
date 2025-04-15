import { Suspense } from "react";
import { fetchUser, useUser } from "../../../hooks/users";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import UserDetail from "../../../components/user-detail";

export default async function Page({ params }) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["user", id],
    queryFn: () => fetchUser(id as number),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <UserDetail />
    </HydrationBoundary>
  );
}
