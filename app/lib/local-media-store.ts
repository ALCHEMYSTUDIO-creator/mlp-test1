"use client";

const DB_NAME = "ilgram-local-media";
const STORE_NAME = "media";
const DB_VERSION = 1;

type StoredMedia = {
  blob: Blob;
  type: string;
};

function openMediaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !("indexedDB" in window)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveLocalMedia(id: string, blob: Blob) {
  const db = await openMediaDb();

  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.put({ blob, type: blob.type }, id);
    transaction.oncomplete = () => {
      db.close();
      resolve();
    };
    transaction.onerror = () => {
      db.close();
      reject(transaction.error);
    };
  });
}

export async function getLocalMedia(id: string): Promise<StoredMedia | null> {
  const db = await openMediaDb();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      db.close();
      resolve((request.result as StoredMedia | undefined) ?? null);
    };
    request.onerror = () => {
      db.close();
      reject(request.error);
    };
  });
}
