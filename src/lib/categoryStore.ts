import { useCallback, useEffect, useMemo, useState } from "react";

export type ManagedCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive: boolean;
  sortOrder: number;
  source: "database" | "local";
  updatedAt: string;
};

type BackendCategory = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  updatedAt?: Date | string;
};

const STORAGE_KEY = "freshflow-managed-categories";
const CHANGE_EVENT = "freshflow-categories-change";

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "category"
  );
}

function readStoredCategories() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as ManagedCategory[];
  } catch {
    return [];
  }
}

function writeStoredCategories(categories: ManagedCategory[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function toManagedCategory(category: BackendCategory): ManagedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    isActive: category.isActive ?? true,
    sortOrder: category.sortOrder ?? 0,
    source: "database",
    updatedAt: String(category.updatedAt ?? new Date().toISOString()),
  };
}

export function mergeCategories(backendCategories: BackendCategory[], localCategories: ManagedCategory[]) {
  const byId = new Map<number, ManagedCategory>();
  backendCategories.map(toManagedCategory).forEach((category) => byId.set(category.id, category));
  localCategories.forEach((category) => byId.set(category.id, category));
  return Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

export function useManagedCategories(backendCategories: BackendCategory[] = []) {
  const [localCategories, setLocalCategories] = useState<ManagedCategory[]>(() =>
    typeof window === "undefined" ? [] : readStoredCategories(),
  );

  useEffect(() => {
    const sync = () => setLocalCategories(readStoredCategories());
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const categories = useMemo(
    () => mergeCategories(backendCategories, localCategories),
    [backendCategories, localCategories],
  );

  const persist = useCallback((next: ManagedCategory[]) => {
    writeStoredCategories(next);
    setLocalCategories(next);
  }, []);

  const createCategory = useCallback(
    (input: { name: string; description?: string; isActive?: boolean }) => {
      const now = new Date().toISOString();
      const next: ManagedCategory = {
        id: -Date.now(),
        name: input.name.trim(),
        slug: slugify(input.name),
        description: input.description?.trim() || null,
        isActive: input.isActive ?? true,
        sortOrder: localCategories.length + backendCategories.length + 1,
        source: "local",
        updatedAt: now,
      };
      persist([next, ...localCategories]);
      return next;
    },
    [backendCategories.length, localCategories, persist],
  );

  const updateCategory = useCallback(
    (id: number, input: Partial<Pick<ManagedCategory, "name" | "description" | "isActive">>) => {
      const existing =
        localCategories.find((category) => category.id === id) ??
        backendCategories.map(toManagedCategory).find((category) => category.id === id);
      if (!existing) return;

      const updated: ManagedCategory = {
        ...existing,
        ...input,
        slug: input.name ? slugify(input.name) : existing.slug,
        source: existing.source === "database" ? "database" : "local",
        updatedAt: new Date().toISOString(),
      };
      persist([updated, ...localCategories.filter((category) => category.id !== id)]);
    },
    [backendCategories, localCategories, persist],
  );

  const deleteCategory = useCallback(
    (id: number) => {
      const backendMatch = backendCategories.some((category) => category.id === id);
      if (backendMatch) {
        updateCategory(id, { isActive: false });
        return;
      }
      persist(localCategories.filter((category) => category.id !== id));
    },
    [backendCategories, localCategories, persist, updateCategory],
  );

  const reorderCategory = useCallback(
    (id: number, direction: "up" | "down") => {
      const current = categories;
      const index = current.findIndex((category) => category.id === id);
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapIndex < 0 || swapIndex >= current.length) return;
      const reordered = [...current];
      const [item] = reordered.splice(index, 1);
      reordered.splice(swapIndex, 0, item);
      const localUpdates = reordered.map((category, sortOrder) => ({
        ...category,
        sortOrder,
        updatedAt: category.updatedAt,
      }));
      persist(localUpdates);
    },
    [categories, persist],
  );

  return {
    categories,
    activeCategories: categories.filter((category) => category.isActive),
    createCategory,
    updateCategory,
    deleteCategory,
    reorderCategory,
  };
}
