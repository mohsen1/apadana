export function assertError<T extends Error = Error>(
  error: unknown,
  expectedErrorClass?: new (...args: unknown[]) => T,
): asserts error is T {
  if (error instanceof (expectedErrorClass || Error)) {
    return;
  }
  throw error;
}
