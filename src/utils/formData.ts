export type FormDataEntryValue = string | File;

export type TypedFormData<T> = {
  get<K extends keyof T>(key: K): T[K];
  getAll<K extends keyof T>(key: K): T[K];
  append<K extends keyof T>(key: K, value: string | Blob): void;
  append<K extends keyof T>(key: K, value: string): void;
  append<K extends keyof T>(key: K, blobValue: Blob, filename?: string): void;
  delete<K extends keyof T>(key: K): void;
  has<K extends keyof T>(key: K): boolean;
  set<K extends keyof T>(key: K, value: string | Blob): void;
  set<K extends keyof T>(key: K, value: string): void;
  set<K extends keyof T>(key: K, blobValue: Blob, filename?: string): void;
};
