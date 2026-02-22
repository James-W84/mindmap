import type { MindMapStorageRecord } from "@/mindmap/types";

const STORAGE_KEY = "mindmap:mvp:v1";

export function loadMindMapFromStorage(): MindMapStorageRecord | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as MindMapStorageRecord;

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    if (!parsed.root || typeof parsed.currentNodeId !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function saveMindMapToStorage(record: MindMapStorageRecord): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}
