import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createStudioTask, loadStudioTask, loadStudioTasks } from "./api";
import type { CreateStudioTaskRequest } from "./types";

export function useStudioTasks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studio-tasks"],
    queryFn: () => loadStudioTasks(),
  });

  return { tasks: data ?? [], isLoading, error };
}

export function useStudioTask(taskId: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studio-tasks", taskId],
    queryFn: () => loadStudioTask(taskId!),
    enabled: !!taskId,
  });

  return { task: data ?? null, isLoading, error };
}

export function useCreateStudioTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateStudioTaskRequest) => createStudioTask(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["studio-tasks"] });
    },
  });
}
