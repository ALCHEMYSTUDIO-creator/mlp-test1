"use client";

import { useCallback, useEffect, useState } from "react";

export type ArchiveItem = {
  id: string;
  date: string;
  missionTitle: string;
  senderRole: "grandchild" | "grandparent";
  message: string;
  grandparentReply: string;
  imagePreview?: string;
  voiceNoteLabel?: string;
  gardenLevelAtThatTime?: number;
  waterCountAtThatTime?: number;
};

const ARCHIVE_STORAGE_KEY = "ilgram-archive";
const EMPTY_ARCHIVE: ArchiveItem[] = [];

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readArchiveItems(): ArchiveItem[] {
  if (typeof window === "undefined") {
    return EMPTY_ARCHIVE;
  }

  try {
    const raw = window.localStorage.getItem(ARCHIVE_STORAGE_KEY);
    if (!raw) {
      return EMPTY_ARCHIVE;
    }

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : EMPTY_ARCHIVE;
  } catch {
    return EMPTY_ARCHIVE;
  }
}

function writeArchiveItems(items: ArchiveItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(items));
}

export function useArchiveStore() {
  const [items, setItems] = useState<ArchiveItem[]>(EMPTY_ARCHIVE);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      setItems(readArchiveItems());
    }, 0);

    const handleStorage = (event: StorageEvent) => {
      if (event.key === ARCHIVE_STORAGE_KEY) {
        setItems(readArchiveItems());
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.clearTimeout(loadTimer);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const addArchiveItem = useCallback(
    (item: Omit<ArchiveItem, "id" | "date">) => {
      const nextItem: ArchiveItem = {
        ...item,
        id: createId(),
        date: new Date().toISOString(),
      };
      const nextItems = [nextItem, ...readArchiveItems()];
      writeArchiveItems(nextItems);
      setItems(nextItems);
    },
    [],
  );

  const deleteArchiveItem = useCallback((id: string) => {
    const nextItems = readArchiveItems().filter((item) => item.id !== id);
    writeArchiveItems(nextItems);
    setItems(nextItems);
  }, []);

  return {
    items,
    addArchiveItem,
    deleteArchiveItem,
  };
}
