import { getBackendBaseURL } from "@/core/config";

import type { CreateMaterialRequest, Material } from "./types";

export async function loadMaterials(): Promise<Material[]> {
  const res = await fetch(`${getBackendBaseURL()}/api/materials`);
  if (!res.ok) {
    throw new Error(`Failed to load materials: ${res.statusText}`);
  }
  const data = (await res.json()) as { materials: Material[] };
  return data.materials;
}

export async function createMaterial(
  request: CreateMaterialRequest,
): Promise<Material> {
  const res = await fetch(`${getBackendBaseURL()}/api/materials/collect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to create material: ${res.statusText}`);
  }
  return res.json() as Promise<Material>;
}

export async function loadMaterial(materialId: string): Promise<Material> {
  const res = await fetch(`${getBackendBaseURL()}/api/materials/${materialId}`);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { detail?: string };
    throw new Error(err.detail ?? `Failed to load material: ${res.statusText}`);
  }
  return res.json() as Promise<Material>;
}
