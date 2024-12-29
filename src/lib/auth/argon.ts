import { Argon2id } from 'oslo/password';

export const argon = new Argon2id({
  // Use lower memory and iterations in test environment for faster tests
  ...(process.env.NODE_ENV === 'test' || process.env.NEXT_PUBLIC_TEST_ENV === 'e2e'
    ? {
        memorySize: 4096, // 4MB instead of default 65536 (64MB)
        iterations: 1, // 1 iteration instead of default 3
      }
    : {}),
});
