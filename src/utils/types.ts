export interface RangeValue<T> {
  start: T;
  end: T;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_TEST_ENV?: 'unit' | 'e2e';
    }
  }
}

export {};
