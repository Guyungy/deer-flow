import { useCallback, useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createStudioTask,
  deleteStudioTask,
  loadStudioTask,
  loadStudioTasks,
  runStudioPipeline,
  updateArticle,
} from "./api";
import type {
  CreateStudioTaskRequest,
  StudioTask,
  UpdateArticleRequest,
} from "./types";

// ---------------------------------------------------------------------------
// Query hooks
// ---------------------------------------------------------------------------

export function useStudioTasks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studio-tasks"],
    queryFn: loadStudioTasks,
  });
  return { tasks: data ?? [], isLoading, error };
}

export function useStudioTask(taskId: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["studio-task", taskId],
    queryFn: () => loadStudioTask(taskId!),
    enabled: !!taskId,
    // Re-fetch while task is still running
    refetchInterval: (query) => {
      const task = query.state.data;
      if (task && (task.status === "running" || task.status === "queued")) {
        return 2000;
      }
      return false;
    },
  });
  return { task: data ?? null, isLoading, error };
}

// ---------------------------------------------------------------------------
// Mutation hooks
// ---------------------------------------------------------------------------

export function useCreateStudioTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateStudioTaskRequest) => createStudioTask(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["studio-tasks"] });
    },
  });
}

export function useDeleteStudioTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId: string) => deleteStudioTask(taskId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["studio-tasks"] });
    },
  });
}

export function useUpdateArticle(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateArticleRequest) => updateArticle(taskId, body),
    onSuccess: (updatedTask) => {
      queryClient.setQueryData(["studio-task", taskId], updatedTask);
    },
  });
}

// ---------------------------------------------------------------------------
// Pipeline execution hook (SSE)
// ---------------------------------------------------------------------------

export function useStudioPipeline(taskId: string | null | undefined) {
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  const start = useCallback(() => {
    if (!taskId || isRunning) return;
    setIsRunning(true);
    setError(null);

    controllerRef.current = runStudioPipeline(taskId, {
      onStageUpdate: (task) => {
        queryClient.setQueryData(["studio-task", taskId], task);
      },
      onDone: (task) => {
        queryClient.setQueryData(["studio-task", taskId], task);
        void queryClient.invalidateQueries({ queryKey: ["studio-tasks"] });
        setIsRunning(false);
      },
      onError: (err) => {
        setError(err);
        setIsRunning(false);
      },
    });
  }, [taskId, isRunning, queryClient]);

  const cancel = useCallback(() => {
    controllerRef.current?.abort();
    setIsRunning(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  return { start, cancel, isRunning, error };
}
