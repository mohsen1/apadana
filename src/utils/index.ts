export function assertError<T extends Error>(error: unknown): asserts error is T {
  if (error instanceof Error) {
    return;
  }
  throw error;
}
