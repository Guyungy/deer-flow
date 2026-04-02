import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { loadHotTopics, refreshHotTopics } from "./api";

export function useHotTopics() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["hot-topics"],
    queryFn: () => loadHotTopics(),
  });

  return { topics: data ?? [], isLoading, error };
}

export function useRefreshHotTopics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => refreshHotTopics(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["hot-topics"] });
    },
  });
}
