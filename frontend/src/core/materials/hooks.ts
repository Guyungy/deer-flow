import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { createMaterial, loadMaterial, loadMaterials } from "./api";
import type { CreateMaterialRequest } from "./types";

export function useMaterials() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["materials"],
    queryFn: () => loadMaterials(),
  });

  return { materials: data ?? [], isLoading, error };
}

export function useMaterial(materialId: string | null | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["materials", materialId],
    queryFn: () => loadMaterial(materialId!),
    enabled: !!materialId,
  });

  return { material: data ?? null, isLoading, error };
}

export function useCreateMaterial() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMaterialRequest) => createMaterial(request),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });
}
