"use client";

import { useCallback, useSyncExternalStore } from "react";

export type ContextSettings = {
  goodTime: string;
  grandparentName: string;
  preferredMission: string;
  userContactTime: string;
  grandparentContactTime: string;
};

export type IlgramRecord = {
  id: string;
  type: "mission" | "water" | "thanks" | "voice" | "phone";
  message: string;
  createdAt: string;
};

export type IlgramState = {
  gardenLevel: number;
  waterCount: number;
  streak: number;
  missionCompleted: boolean;
  lastMissionDate: string;
  contextSettings: ContextSettings;
  records: IlgramRecord[];
};

const STORAGE_KEY = "ilgram-state";

const DEFAULT_STATE: IlgramState = {
  gardenLevel: 1,
  waterCount: 0,
  streak: 0,
  missionCompleted: false,
  lastMissionDate: "",
  contextSettings: {
    goodTime: "저녁",
    grandparentName: "할머니",
    preferredMission: "사진",
    userContactTime: "저녁",
    grandparentContactTime: "저녁",
  },
  records: [],
};

export const defaultIlgramState = DEFAULT_STATE;

let currentState: IlgramState = DEFAULT_STATE;
let didReadStorage = false;
const listeners = new Set<() => void>();

function isIlgramState(value: unknown): value is Partial<IlgramState> {
  return Boolean(value && typeof value === "object");
}

function normalizeIlgramState(value: Partial<IlgramState>): IlgramState {
  return {
    ...DEFAULT_STATE,
    ...value,
    contextSettings: {
      ...DEFAULT_STATE.contextSettings,
      ...value.contextSettings,
    },
    records: Array.isArray(value.records) ? value.records : [],
  };
}

function readIlgramStateFromStorage(): IlgramState {
  if (typeof window === "undefined") {
    return DEFAULT_STATE;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_STATE;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!isIlgramState(parsed)) {
      return DEFAULT_STATE;
    }

    return normalizeIlgramState(parsed);
  } catch {
    return DEFAULT_STATE;
  }
}

function ensureStorageRead() {
  if (typeof window === "undefined") {
    return;
  }

  if (!didReadStorage) {
    currentState = readIlgramStateFromStorage();
    didReadStorage = true;
  }
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getIlgramSnapshot() {
  ensureStorageRead();
  return currentState;
}

function getIlgramServerSnapshot() {
  return DEFAULT_STATE;
}

export function readIlgramState(): IlgramState {
  return getIlgramSnapshot();
}

export function writeIlgramState(nextState: IlgramState) {
  currentState = normalizeIlgramState(nextState);

  if (typeof window !== "undefined") {
    didReadStorage = true;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
  }

  emitChange();
}

function subscribeToIlgramState(callback: () => void) {
  listeners.add(callback);

  if (typeof window === "undefined") {
    return () => {
      listeners.delete(callback);
    };
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) {
      return;
    }

    currentState = readIlgramStateFromStorage();
    didReadStorage = true;
    callback();
  };

  window.addEventListener("storage", handleStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", handleStorage);
  };
}

export function useIlgramState() {
  const state = useSyncExternalStore(
    subscribeToIlgramState,
    getIlgramSnapshot,
    getIlgramServerSnapshot,
  );

  const updateState = useCallback(
    (updater: (current: IlgramState) => IlgramState) => {
      const current = readIlgramState();
      const nextState = updater(current);
      writeIlgramState(nextState);
    },
    [],
  );

  return { state, updateState, isLoaded: true };
}

export function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function addRecord(
  state: IlgramState,
  record: Omit<IlgramRecord, "id" | "createdAt">,
): IlgramState {
  const nextRecord: IlgramRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  return {
    ...state,
    records: [nextRecord, ...state.records].slice(0, 12),
  };
}
